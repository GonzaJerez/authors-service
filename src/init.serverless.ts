import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;

// Esta funcion retorna el inicio de la aplicación
async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// Funcion que ejecuta la lambda, comunica con la app de nestjs
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  // Si ya esta inicializada la app no vuelve a inicializarla y usa la misma para q arranque mas rapido
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
