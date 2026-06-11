variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name used as resource name prefix"
  type        = string
}

variable "billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_dynamodb_table" "cards" {
  name         = "${var.project_name}_${var.environment}_cards"
  billing_mode = var.billing_mode

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "category-index"
    hash_key        = "category"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = {
    Name = "${var.project_name}-cards"
  }
}

output "table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.cards.name
}

output "table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.cards.arn
}

output "table_prefix" {
  description = "Table name prefix for application config"
  value       = "${var.project_name}_${var.environment}_"
}
