#!bin/bash

docker rmi -f te-auth-api
$(aws ecr get-login --no-include-email --profile te-user --region us-east-2)
docker build -t te-auth-api:v1.0 .
docker tag te-auth-api:v1.0 354522176000.dkr.ecr.us-east-2.amazonaws.com/te-auth-api:v1.0
docker push 354522176000.dkr.ecr.us-east-2.amazonaws.com/te-auth-api:v1.0
