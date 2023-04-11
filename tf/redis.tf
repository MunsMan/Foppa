resource "helm_release" "redis" {
  name       = "redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  values = [
    file("${path.module}/../redis/values.yaml")
  ]
}
