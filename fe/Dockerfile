FROM node:18.19.1-alpine as fe-base

# Install dependencies
RUN apk update && apk add curl

############################### Development ########################################

FROM fe-base as fe-dev

# Set the workdir
WORKDIR /home/node/db
