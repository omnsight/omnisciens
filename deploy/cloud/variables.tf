variable "region" {
  description = "Alibaba Cloud region"
  default     = "cn-hangzhou"
}

variable "ecs_instance_type" {
  description = "ECS instance type"
  default     = "ecs.t5-lc1m2.small"
}

variable "ecs_password" {
  description = "ECS instance password"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}