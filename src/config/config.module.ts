import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        // PROD
        MONGO_URI: Joi.string().required(),
        NODE_ENV: Joi.string().valid('prod', 'dev').required(),
        SERVER_MODE: Joi.string().valid('http', 'serverless').required(),
        POSTS_FUNCTION_NAME: Joi.string().required(),
        API_GATEWAY_ID: Joi.string().required(),

        // DEV
        POSTS_API_URL: Joi.string(),
        HTTP_PORT: Joi.number(),
        DB_PORT: Joi.number(),
      }),
    }),
  ],
})
export class ConfigModule {}
