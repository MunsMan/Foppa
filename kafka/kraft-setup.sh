#! /usr/bin/env sh

# Exit in case of error
set -e

## Set variables
export NAMESPACE=kafka \
  RELEASE_NAME=kafka-test \

## Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

## Create namespace
kubectl create namespace $NAMESPACE

## Install chart
helm install $RELEASE_NAME \
  --values values.yaml \
  --namespace $NAMESPACE \
  bitnami/kafka