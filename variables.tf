variable "base_path" {
  description = "Base directory for the project (local or cloud). Use forward slashes only."
  type        = string
  default     = "./"
}

variable "aws_region" {
  description = "AWS region for the render worker"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the render worker"
  type        = string
  default     = "t3.medium"
}
