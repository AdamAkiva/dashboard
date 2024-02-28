FROM node:18.19.1-alpine as be-base

# Install dependencies
RUN apk update && apk add curl

################################ Development ###################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node/db
