FROM node:lts-alpine3.19 as be-base

# Install dependencies
RUN apk update && apk add curl

############################### Development ########################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node/dashboard

# TODO Add more services in the same format for CI/CD Tests and production
