resource "helm_release" "coredns" {
	name = "coredns"
	repository = "https://coredns.github.io/helm"
	chart = "coredns"
	values = [
		file("${path.module}/../coredns/values.yaml")
	]
}
