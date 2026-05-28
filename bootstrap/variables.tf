variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "brassvalve-terraform-state"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for Terraform locking"
  type        = string
  default     = "brassvalve-terraform-lock"
}