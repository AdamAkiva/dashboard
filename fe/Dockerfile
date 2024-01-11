FROM node:lts-alpine3.19 as fe-base

# Install dependencies
RUN apk add curl

############################### Development ########################################

FROM fe-base as fe-dev

# Set the workdir
WORKDIR /home/node

################################ Local Tests #######################################

FROM cypress/included:cypress-13.5.1-node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1 as fe-test

# Build time arguments
ARG HOST_UID=${HOST_UID}
ARG HOST_GID=${HOST_GID}

# Create new user and home folder for that user
RUN groupadd -g ${HOST_GID} testUser
RUN useradd -r --no-log-init -u ${HOST_UID} -g testUser testUser
RUN install -d -m 0755 -o testUser -g testUser /home/testUser

# Move cypress cache folder from root to the user
RUN mv /root/.cache /home/testUser/.cache
# Set new path for the cypress cache folder
ENV CYPRESS_CACHE_FOLDER=/home/testUser/.cache/Cypress

# Set the user
USER testUser

# Set the workdir
WORKDIR /home/testUser

# Copy the files needed fro the tests
COPY --chown=testUser \
    ./package*.json \
    ./tsconfig*.json \
    ./cypress.config.ts \
    ./vite.config.ts \
    ./

# Install dependencies
RUN npm ci

################################## CI Tests ########################################

FROM fe-base as fe-ci

# Copy resources
WORKDIR /home/node
COPY \
    ./.eslintrc.cjs \
    ./package*.json \
    ./tsconfig*.json \
    ./vite.config.ts \
    ./index.html \
    ./

# Install dependencies
RUN npm install

COPY ./src ./src
COPY ./cypress ./cypress

#################################### Build #########################################

FROM fe-base as fe-build-prod

# Copy build resources
WORKDIR /home/node
COPY \
    ./index.html \
    ./package*.json \
    ./tsconfig*.json \
    ./vite.config.ts \
    ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ./src ./src
COPY ./public ./public

# Build for production
RUN npm run build

# TODO At this point, we have a static build folder with assets which needs to be
# copied to a reverse proxy for static serving

################################ Production ########################################

# TODO
