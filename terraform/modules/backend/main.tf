variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name used as resource name prefix"
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
}

variable "lambda_memory_size" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB cards table"
  type        = string
}

variable "dynamodb_table_prefix" {
  description = "DynamoDB table name prefix for application config"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for token validation"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

variable "cors_allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

# ----------------------------------------------------------
# Lambda
# ----------------------------------------------------------

resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-${var.environment}-api-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-${var.environment}-dynamodb-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
          "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan",
          "dynamodb:BatchWriteItem", "dynamodb:BatchGetItem"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      }
    ]
  })
}

data "archive_file" "lambda_dummy" {
  type        = "zip"
  output_path = "${path.module}/.tmp/lambda_dummy.zip"
  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'OK' });"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-${var.environment}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "src/lambda.handler"
  runtime       = "nodejs20.x"

  filename         = data.archive_file.lambda_dummy.output_path
  source_code_hash = data.archive_file.lambda_dummy.output_base64sha256

  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV              = var.environment
      APP_AWS_REGION        = var.aws_region
      DYNAMODB_TABLE_PREFIX = var.dynamodb_table_prefix
      COGNITO_USER_POOL_ID  = var.cognito_user_pool_id
      COGNITO_CLIENT_ID     = var.cognito_client_id
      CORS_ORIGIN           = join(",", var.cors_allowed_origins)
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = var.environment == "prod" ? 90 : 14
}

# ----------------------------------------------------------
# API Gateway
# ----------------------------------------------------------

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins     = var.cors_allowed_origins
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key"]
    expose_headers    = ["Content-Type"]
    max_age           = 300
    allow_credentials = true
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/api-gateway/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 14
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}
