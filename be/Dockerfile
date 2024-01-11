FROM node:lts-alpine3.19 as be-base

# Install dependencies
RUN apk update && apk add curl

############################### Development ########################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node

################################### Test ###########################################

FROM be-base as be-ci

# Copy resources
WORKDIR /home/node
COPY \
    ./.eslintrc.cjs \
    ./package*.json \
    ./tsconfig*.json \
    ./loader.js \
    ./nodemon.json \
    ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./src ./src
COPY ./__tests__ ./__tests__

#################################### Build #########################################

FROM be-base as be-build-prod

# Copy build resources
WORKDIR /home/node
COPY \
    ./.eslintrc.cjs \
    ./package*.json \
    ./tsconfig*.json \
    ./

# Build for production
RUN npm ci
RUN npm run build
RUN npm prune --production

# Copy source code
COPY ./src ./src
RUN rm -rf ./src/api-docs

# Prepare build folder for next stage
RUN mkdir -p build_context
RUN mv ./build ./build_context/src
RUN cp -r ./package.json ./node_modules ./build_context

################################ Production ########################################

FROM be-base as be-prod

# Copy built app to a folder owned by node user
WORKDIR /home/node
COPY --chown=node:node --from=be-build /home/node/build_context ./
USER node

ENTRYPOINT ["node", "./src/main.js"]
