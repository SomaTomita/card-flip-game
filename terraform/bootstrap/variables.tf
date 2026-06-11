variable "project_name" {
  description = "Project name used as resource name prefix"
  type        = string
  default     = "cardflip"
}

variable "aws_region" {
  description = "AWS region for the state backend"
  type        = string
  default     = "ap-northeast-1"
}
