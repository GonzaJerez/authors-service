import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        NODE_ENV: Joi.string().valid('prod', 'dev').required(),
        SERVER_MODE: Joi.string().valid('http', 'serverless').required(),
      }),
    }),
  ],
})
export class ConfigModule {}
