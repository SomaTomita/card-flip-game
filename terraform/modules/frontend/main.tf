variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name used as resource name prefix"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "api_endpoint" {
  description = "Backend API endpoint URL to inject as VITE_API_URL"
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.account_id
  name              = "${var.project_name}-${var.environment}"
  production_branch = "main"

  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
    root_dir        = "client"
  }

  source {
    type = "github"
    config {
      owner                         = var.github_owner
      repo_name                     = var.github_repo
      production_branch             = "main"
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_deployment_setting    = "custom"
      preview_branch_includes       = ["dev", "staging"]
    }
  }

  deployment_configs {
    production {
      environment_variables = {
        NODE_VERSION = "20"
        # client axios baseURL expects the full cards collection path (client.get('/'))
        VITE_API_URL = "${var.api_endpoint}/api/cards"
      }
    }
    preview {
      environment_variables = {
        NODE_VERSION = "20"
        # client axios baseURL expects the full cards collection path (client.get('/'))
        VITE_API_URL = "${var.api_endpoint}/api/cards"
      }
    }
  }
}

output "pages_url" {
  description = "Cloudflare Pages deployment URL"
  value       = "https://${cloudflare_pages_project.frontend.subdomain}.pages.dev"
}
