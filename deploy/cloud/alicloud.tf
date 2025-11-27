# Terraform configuration for Alibaba Cloud deployment

terraform {
  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.0"
    }
  }
}

# Provider configuration
provider "alicloud" {
  region = var.region
}

# Variables
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

# VPC
resource "alicloud_vpc" "omni_vpc" {
  vpc_name   = "omni-vpc"
  cidr_block = "10.0.0.0/8"
}

# VSwitch
resource "alicloud_vswitch" "omni_vswitch" {
  vpc_id     = alicloud_vpc.omni_vpc.id
  cidr_block = "10.0.0.0/16"
  zone_id    = "cn-hangzhou-a"
}

# Security group
resource "alicloud_security_group" "omni_sg" {
  name   = "omni-security-group"
  vpc_id = alicloud_vpc.omni_vpc.id
}

# Security group rules
resource "alicloud_security_group_rule" "allow_http" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "80/80"
  priority          = 1
  security_group_id = alicloud_security_group.omni_sg.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_security_group_rule" "allow_https" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "443/443"
  priority          = 1
  security_group_id = alicloud_security_group.omni_sg.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_security_group_rule" "allow_ssh" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "22/22"
  priority          = 1
  security_group_id = alicloud_security_group.omni_sg.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_security_group_rule" "allow_all_egress" {
  type              = "egress"
  ip_protocol       = "all"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "-1/-1"
  priority          = 1
  security_group_id = alicloud_security_group.omni_sg.id
  cidr_ip           = "0.0.0.0/0"
}

# ECS Instance for services
resource "alicloud_instance" "omni_ecs" {
  availability_zone = "cn-hangzhou-a"
  security_groups   = [alicloud_security_group.omni_sg.id]

  instance_type              = var.ecs_instance_type
  system_disk_category       = "cloud_efficiency"
  system_disk_size           = 40
  image_id                   = "ubuntu_20_04_x64_20G_alibase_20210420.vhd"
  instance_name              = "omni-services"
  vswitch_id                 = alicloud_vswitch.omni_vswitch.id
  internet_max_bandwidth_out = 10
  password                   = var.ecs_password

  tags = {
    Name = "Omni Services"
  }
}

# NAS File System for backups
resource "alicloud_nas_file_system" "omni_backup" {
  protocol_type = "NFS"
  storage_type  = "Performance"
}

# NAS Mount Target
resource "alicloud_nas_mount_target" "omni_mount" {
  file_system_id = alicloud_nas_file_system.omni_backup.id
  vswitch_id     = alicloud_vswitch.omni_vswitch.id
}

# RDS MySQL instance for Keycloak
resource "alicloud_db_instance" "keycloak_db" {
  engine                   = "MySQL"
  engine_version           = "8.0"
  instance_type            = "rds.mysql.t1.small"
  instance_storage         = "20"
  instance_name            = "keycloak-db"
  db_instance_net_type     = "Intranet"
  connection_mode          = "Standard"
  zone_id                  = "cn-hangzhou-a"
  security_ips             = ["10.0.0.0/8"]
  db_instance_description  = "Database for Keycloak"
}

# Database for Keycloak
resource "alicloud_db_database" "keycloak_db_schema" {
  instance_id = alicloud_db_instance.keycloak_db.id
  name        = "keycloak"
}

# Database account for Keycloak
resource "alicloud_db_account" "keycloak_db_user" {
  instance_id = alicloud_db_instance.keycloak_db.id
  name        = "keycloak_user"
  password    = var.db_password
  description = "Keycloak database user"
}

# Grant privileges to Keycloak database user
resource "alicloud_db_account_privilege" "keycloak_privilege" {
  instance_id  = alicloud_db_instance.keycloak_db.id
  account_name = alicloud_db_account.keycloak_db_user.name
  privilege    = "ReadWrite"
  db_names     = [alicloud_db_database.keycloak_db_schema.name]
}

# RAM Role for ECS to access other Alibaba Cloud services
resource "alicloud_ram_role" "ecs_role" {
  name     = "omni-ecs-role"
  document = <<EOF
  {
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
          "Service": [
            "ecs.aliyuncs.com"
          ]
        }
      }
    ],
    "Version": "1"
  }
  EOF
  description = "Role for Omni ECS instance to access Alibaba Cloud services"
}

# Policy for accessing secrets and NAS
resource "alicloud_ram_policy" "omni_policy" {
  policy_name     = "omni-policy"
  policy_document = <<EOF
  {
    "Statement": [
      {
        "Action": [
          "kms:Decrypt",
          "secretsmanager:GetSecretValue"
        ],
        "Effect": "Allow",
        "Resource": [
          "*"
        ]
      },
      {
        "Action": [
          "nas:DescribeFileSystems",
          "nas:DescribeMountTargets"
        ],
        "Effect": "Allow",
        "Resource": [
          "*"
        ]
      }
    ],
    "Version": "1"
  }
  EOF
  description = "Policy for Omni services to access secrets and NAS"
}

# Attach policy to role
resource "alicloud_ram_role_policy_attachment" "attach_policy" {
  policy_name = alicloud_ram_policy.omni_policy.name
  policy_type = alicloud_ram_policy.omni_policy.type
  role_name   = alicloud_ram_role.ecs_role.name
}

# Secrets Manager secrets for services
resource "alicloud_secretsmanager_secret" "keycloak_client_secret" {
  secret_name = "omni-keycloak-client-secret"
  secret_data = "placeholder-secret-value"
  description = "Keycloak client secret for Omni services"
  tags = {
    Name = "Omni Keycloak Secret"
  }
}

resource "alicloud_secretsmanager_secret" "arangodb_password" {
  secret_name = "omni-arangodb-password"
  secret_data = "placeholder-password-value"
  description = "ArangoDB password for Omni services"
  tags = {
    Name = "Omni ArangoDB Secret"
  }
}

resource "alicloud_secretsmanager_secret" "keycloak_admin_password" {
  secret_name = "omni-keycloak-admin-password"
  secret_data = var.db_password
  description = "Keycloak admin password"
  tags = {
    Name = "Omni Keycloak Admin Secret"
  }
}

# Outputs
output "ecs_public_ip" {
  value = alicloud_instance.omni_ecs.public_ip
}

output "keycloak_db_endpoint" {
  value = alicloud_db_instance.keycloak_db.connection_string
}

output "nas_mount_point" {
  value = alicloud_nas_mount_target.omni_mount.mount_target_domain
}