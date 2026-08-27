import express from 'express';
import { errorHandlerMiddleware } from './error_handler_middleware.js';
import { logMiddleware } from './log_middleware.js';
import { authorizationMiddleware } from './authorization_middleware.js';
import { corsMiddleware } from './cors_middleware.js';
import config from '../config.js';

export default function configureMiddlewares(router) {
  router.use(express.json());
  router.use(logMiddleware);
  router.use(authorizationMiddleware);
  if (config.cors) {
    router.use(corsMiddleware);
  }
  router.use(errorHandlerMiddleware);
}

