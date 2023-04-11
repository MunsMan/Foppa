#! /usr/bin/env sh

# Exit in case of error
set -e

## Set variables
export NAMESPACE=krakend \
  RELEASE_NAME=krakend-test \
  CONTAINER_IMAGE_NAME=k8s-krakend:0.0.1

## Create Container Image
# eval $(minikube docker-env)

docker build -t $CONTAINER_IMAGE_NAME .

cat krakend.yaml | sed "s/CONTAINER_IMAGE_NAME/$CONTAINER_IMAGE_NAME/" > krakend_release.yaml

## Create namespace
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

kubectl create -f krakend_release.yaml