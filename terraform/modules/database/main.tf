variable "environment" { type = string }
variable "project_name" { type = string }
variable "billing_mode" { type = string }

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

output "table_name" { value = aws_dynamodb_table.cards.name }
output "table_arn" { value = aws_dynamodb_table.cards.arn }
output "table_prefix" { value = "${var.project_name}_${var.environment}_" }
