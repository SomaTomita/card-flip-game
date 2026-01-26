variable "project_name" { default = "cardflip" }
variable "environment" { default = "dev" }
variable "aws_region" { default = "ap-northeast-1" }

# Cloudflare
variable "cloudflare_api_token" { sensitive = true }
variable "cloudflare_account_id" {}
variable "github_owner" {}
variable "github_repo" {}

# Lambda
variable "lambda_memory_size" { default = 256 }
variable "lambda_timeout" { default = 30 }

# DynamoDB
variable "dynamodb_billing_mode" { default = "PAY_PER_REQUEST" }

# Cognito
variable "cognito_callback_urls" { type = list(string) }
variable "cognito_logout_urls" { type = list(string) }

# CORS
variable "cors_allowed_origins" { type = list(string) }
