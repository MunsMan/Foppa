resource "kubernetes_deployment" "deployment_first_responder" {
  metadata {
    name = "first-responder"
  }
  spec {
    selector {
      match_labels = {
        app = "first-responder"
      }
    }
    replicas = 2
    template {
      metadata {
        labels = {
          app = "first-responder"
        }
      }
      spec {
        container {
          name  = "first-responder"
          image = "ghcr.io/munsman/foppa/first_responder:0.0.1"
          port {
            container_port = 8080
          }
          env {
            name  = "REDIS_PASSWORD"
            value = var.redis_password
          }
        }
      }
    }
  }
}


resource "kubernetes_service" "first_responder_svc" {
  metadata {
    name = "first-responder"
  }
  spec {
    selector = {
      app = kubernetes_deployment.deployment_first_responder.spec.0.template.0.metadata.0.labels.app
    }
    port {
      port        = 8000
      target_port = 8080
    }
  }
}
