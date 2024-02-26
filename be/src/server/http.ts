import Fastify from 'fastify';

const fastify = Fastify({
  connectionTimeout: 524_288,
  keepAliveTimeout: 4_000,
  requestTimeout: 32_000,
  ignoreTrailingSlash: true,
  maxParamLength: 32,
  bodyLimit: 16_777_216
});

fastify.listen();
