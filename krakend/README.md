# Krakend

## Deployment

Due to the 2-Step Docker build, we need to deploy via `kubectl` directly.
All deployment configuration will be found in the `krakend.yaml` file in this directory.


To deploy, just run

```
	kubectl create -f krakend/krakend.yaml
```
