
resource "kubernetes_deployment" "deployment_krakend" {
  metadata {
    name = "krakend"
  }
  spec {
    selector {
      match_labels = {
        app = "krakend"
      }
    }
    replicas = 2
    template {
      metadata {
        labels = {
          app = "krakend"
        }
      }
      spec {
        container {
          name  = "krakend"
          image = "ghcr.io/munsman/foppa/krakend:0.0.1"
          # image_l_policy = "Always"
          port {
            container_port = 8080
          }
          command = ["/usr/bin/krakend"]
          args    = ["run", "-d", "-c", "/etc/krakend/krakend.json", "-p", "8080"]
          env {
            name  = "KRAKEND_PORT"
            value = "8080"
          }
        }
      }
    }
  }
}


resource "kubernetes_service" "krakend_service" {
  metadata {
    name = "krakend"
  }
  spec {
    selector = {
      app = "krakend"
    }
    type = "NodePort"
    port {
      port        = 8000
      target_port = 8080
    }
  }
}
resource "kubernetes_service" "krakend_telemetry" {
  metadata {
    name = "krakend-tele"
  }
  spec {
    selector = {
      app = "krakend"
    }
    type = "NodePort"
    port {
      port        = 8090
      target_port = 8090
    }
  }
}
