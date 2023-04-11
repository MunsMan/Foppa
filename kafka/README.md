# Kafka

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
	helm install kafka --values kafka/values.yaml bitnami/kafka
```
## Commands

The Bitnami Helm image contains multiple script for executing and configuring the Kafka instance. These files are stored inside the `/opt/bitnami/kafka/bin` folder.

To Create a Topic:

```
	kafka-topics.sh --bootstrap-server localhost:9092 --create --topic my-topic --partitions 3 \
  --replication-factor 3 --config max.message.bytes=64000 --config flush.messages=1
```

To update old Configurations like the Topic:
```
	kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name my-topic
  --alter --add-config max.message.bytes=128000
```