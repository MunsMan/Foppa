resource "helm_release" "kafka" {
  name       = "kafka"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "kafka"
  values = [
    file("${path.module}/../kafka/values.yaml")
  ]
}