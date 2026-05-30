# Infraestrutura

## Local (desenvolvimento)
```bash
docker compose up -d   # Postgres :5432 + Redis :6379
```

## Produção (AWS/EKS)
- Imagem da API construída via `backend/Dockerfile` e publicada num registry (ECR).
- `k8s/api-deployment.yaml`: Deployment + Service + HPA (autoscaling 3→20 por CPU).
- Banco gerenciado: RDS PostgreSQL Multi-AZ; cache: ElastiCache Redis; storage: S3.
- Secrets via AWS Secrets Manager (referenciados como `finlytics-secrets`).
- Observabilidade: CloudWatch + OpenTelemetry; CI/CD via GitHub Actions.
