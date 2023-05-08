# Foppa

This is the Readme for the Foppa Project. The Idea of this Project is, to optimize the Runtime of Serverless function across different Service Providern.


## Development

Because we can't deploy functions yet, there are hardcoded function inside the system.

username = munsman
functionId = abc


## AWS

In this section all the configurations and resources are noted. Currently, I will use the web interface due to the limitations of the academy.


### VPC

The entire backend shoud be secured by using a VPC. 

The VPC contains:
- foppa-backend
    10.0.0.0/16


### Redis

AWS offers two different redis services.
- (MemoryDB)[https://aws.amazon.com/memorydb/]
- (ElastiCache)[https://aws.amazon.com/elasticache/]

For this Project we are using ElastiCache as our in memory database.

The instance is called `redis-cluster` and lives in the VPC `foppa-backend` with the subnets `redis-subnet-1` and `redis-subnet-2`.

Like the default of redis we are using the port 6379.

Currently we are only using a single instance and one replica.
