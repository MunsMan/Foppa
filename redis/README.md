# Redis

## Deployment


Adding Helm Chart Repository

```
	helm repo add bitnami https://charts.bitnami.com/bitnami
```

Updating Repository

```
	helm repo update
```

Installing Kafka on the cluster

```
	helm install redis --values redis/values.yaml bitnami/redis
```
