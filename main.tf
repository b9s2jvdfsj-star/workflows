terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

/* ---------- Random ID for bucket uniqueness ---------- */
resource "random_id" "suffix" {
  byte_length = 4
}

/* ---------- S3 Bucket for Asset Exchange ---------- */
resource "aws_s3_bucket" "assets" {
  bucket = "brassvalve-assets-${random_id.suffix.hex}"
  acl    = "private"

  tags = {
    Project = "BrassValve_Restoration_MASTER"
  }
}

/* ---------- IAM Role & Policy for EC2 ---------- */
resource "aws_iam_role" "ec2_s3_role" {
  name = "brassvalve-ec2-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "s3_access" {
  name        = "brassvalve-s3-access"
  description = "Read/write access to the BrassValve assets bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ]
      Resource = [
        aws_s3_bucket.assets.arn,
        "${aws_s3_bucket.assets.arn}/*"
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

/* ---------- EC2 Instance (Render Worker) ---------- */
resource "aws_instance" "render_worker" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  iam_instance_profile        = aws_iam_instance_profile.render_profile.name
  associate_public_ip_address = true

  tags = {
    Name = "BrassValve-Render-Worker"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              # Sync assets from S3 to the instance
              aws s3 sync s3://${aws_s3_bucket.assets.bucket}/raw-assets/ ${var.base_path}01_raw-assets/ --delete
              aws s3 sync s3://${aws_s3_bucket.assets.bucket}/final-delivery/ ${var.base_path}06_final-delivery/ --delete

              # Run the local render script (adjust if using bash wrapper)
              pwsh -File ${var.base_path}rendering-scripts/render-local.ps1

              # Push results back to S3
              aws s3 sync ${var.base_path}06_final-delivery/ s3://${aws_s3_bucket.assets.bucket}/final-delivery/ --delete
              EOF
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_iam_instance_profile" "render_profile" {
  name = "brassvalve-ec2-instance-profile"
  role = aws_iam_role.ec2_s3_role.name
}

/* ---------- Outputs ---------- */
output "bucket_name" {
  description = "S3 bucket name for asset exchange"
  value       = aws_s3_bucket.assets.id
}

output "instance_id" {
  description = "EC2 instance ID of the render worker"
  value       = aws_instance.render_worker.id
}

output "public_ip" {
  description = "Public IP of the render worker (for SSH if needed)"
  value       = aws_instance.render_worker.public_ip
}
