# 阿里云部署

此目录包含用于在阿里云上部署 Omni 服务的 Terraform 配置。

## 架构设计

1. 使用一个 ECS 实例运行所有服务以优化成本
2. 使用阿里云 RDS MySQL 作为 Keycloak 的数据库
3. 使用阿里云 NAS 进行数据备份
4. 使用凭据管家并通过 CSI 传递密钥

## 先决条件

1. 安装 Terraform
2. 配置阿里云访问凭证
3. 准备 ECS 实例密码和数据库密码

## 部署步骤

1. 初始化 Terraform:
   ```
   terraform init
   ```

2. 查看部署计划:
   ```
   terraform plan
   ```

3. 应用部署:
   ```
   terraform apply
   ```

## 配置变量

可以通过以下方式设置敏感变量:

1. 使用环境变量:
   ```
   export TF_VAR_ecs_password=your_ecs_password
   export TF_VAR_db_password=your_db_password
   ```

2. 使用 tfvars 文件:
   创建 `terraform.tfvars` 文件并添加:
   ```
   ecs_password = "your_ecs_password"
   db_password = "your_db_password"
   ```

## 凭据管理

云部署使用阿里云 Secrets Manager 来管理敏感信息：

1. Keycloak 客户端密钥
2. ArangoDB 密码
3. Keycloak 管理员密码

这些凭据通过 RAM 角色和策略安全地传递给 ECS 实例，并使用 CSI 驱动挂载到容器中。

## 注意事项

- 此配置考虑了性价比，将所有服务运行在一个 ECS 实例上
- 数据库使用阿里云 RDS 以确保数据安全和备份
- 备份存储使用阿里云 NAS
- 凭据通过 Secrets Manager 安全管理，而不是硬编码在配置文件中