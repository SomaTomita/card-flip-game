variable "environment" { type = string }
variable "project_name" { type = string }
variable "account_id" { type = string }
variable "api_token" { type = string }
variable "api_endpoint" { type = string }
variable "github_owner" { type = string }
variable "github_repo" { type = string }

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
        VITE_API_URL = var.api_endpoint
      }
    }
    preview {
      environment_variables = {
        NODE_VERSION = "20"
        VITE_API_URL = var.api_endpoint
      }
    }
  }
}

output "pages_url" { value = "https://${cloudflare_pages_project.frontend.subdomain}.pages.dev" }
