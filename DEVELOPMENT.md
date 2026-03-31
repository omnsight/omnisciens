## 📦 Installation Guide

This project is managed with [uv](https://github.com/astral-sh/uv).

Install/Upgrade dependencies:

```bash
npm install
```

Clean up:

```bash
npm run clean
```

## Run Services Locally & Debug

Log in gchr:

```bash
echo "your PAT password" | docker login ghcr.io -u "your username" --password-stdin
docker pull --platform <platform> ghcr.io/omnsight/<image>:main
docker tag ghcr.io/omnsight/<image>:main <image>:latest
```

Run the application:

```bash
docker-compose up -d --wait
docker compose down
# arango db dashboard can be accessed at http://localhost:8529
```

Debug:

```bash
docker system prune -a
docker inspect <container name>
docker logs <container name>
```

## ✅ Running Unit Tests

```bash
npm test
```

## 💅 Formatting Code

Format the code using black:

```bash
npm run lint
```

## 🚀 Deploy To Production

Set up credential:

```bash
aws sts get-caller-identity --profile NexusAdminAccess
aws configure sso
```

Bootstrap:

```bash
cdk bootstrap --profile NexusAdminAccess
```

Run build:

```bash
npm run build
cdk synth --all
```

Deploy:

```bash
cdk list
cdk diff <stack name> --profile NexusAdminAccess

aws sso login --profile NexusAdminAccess
cdk deploy <stack name> --profile NexusAdminAccess

cdk destroy <stack name>

# to live update a dev stack by changes in code
cdk watch <stack name> --profile NexusAdminAccess
```

### Toubleshooting

#### Investigate EC2 Instance Startup

Check these logs:

```bash
/var/log/cloud-init-output.log
/var/log/cloud-init.log
/var/log/messages
```

Use these commands:

```bash
cloud-init status --wait
cloud-init analyze show
```

Check system log from AWS console: EC2 > Instances > [Your Instance] > Actions > Monitor and troubleshoot > Get system log.

Investigate docker containers:

```bash
sudo docker ps -a
sudo docker logs <container name>
```
