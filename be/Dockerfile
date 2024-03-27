FROM node:20.11.1-alpine as be-base

# Install dependencies
RUN apk update && apk add --no-cache curl=8.5.0-r0

################################ Development ###################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node/dashboard
