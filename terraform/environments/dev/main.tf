terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ----------------------------------------------------------
# Modules
# ----------------------------------------------------------

module "database" {
  source = "../../modules/database"

  environment  = var.environment
  project_name = var.project_name
  billing_mode = var.dynamodb_billing_mode
}

module "auth" {
  source = "../../modules/auth"

  environment   = var.environment
  project_name  = var.project_name
  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls
}

module "backend" {
  source = "../../modules/backend"

  environment           = var.environment
  project_name          = var.project_name
  aws_region            = var.aws_region
  lambda_memory_size    = var.lambda_memory_size
  lambda_timeout        = var.lambda_timeout
  dynamodb_table_arn    = module.database.table_arn
  dynamodb_table_prefix = module.database.table_prefix
  cognito_user_pool_id  = module.auth.user_pool_id
  cognito_client_id     = module.auth.client_id
  cors_allowed_origins  = var.cors_allowed_origins
}

module "frontend" {
  source = "../../modules/frontend"

  environment  = var.environment
  project_name = var.project_name
  account_id   = var.cloudflare_account_id
  api_token    = var.cloudflare_api_token
  api_endpoint = module.backend.api_endpoint
  github_owner = var.github_owner
  github_repo  = var.github_repo
}
