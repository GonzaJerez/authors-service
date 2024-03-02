# AUTHORS MICROSERVICE

## Instalaciones necesarias

Asegurarse de tener instalado en su sistema:

- pnpm -> `pnpm i -g pnpm`
- serverless -> `pnpm i -g serverless`
- docker -> https://docs.docker.com/engine/install/

## Prerequisitos

Un bucket S3 de destino. Este bucket debe tener acceso publico (Habilitar acceso publico y ademas establecer politicas para este acceso publico)

Tener un usuario IAM en aws con los permisos para subir imagenes a un bucket S3, las keys de este usuario son necesarias para el sdk usado en el codigo.

Permisos que debe tener: _putObject_

## Levantar entorno local

#### Variables de entorno

Renombrar archivo ".env.example" a ".env" y configurar las variables de entorno _en caso de ser necesario_

#### Levantar base de datos local

    pnpm db:up

#### Levantar servidor http en desarrollo

    pnpm start:dev

#### Levantar serverless en desarrollo

    pnpm sls:dev

## Eliminar base de datos local

    pnpm db:down

## Despliegue a produccion (AWS)

> Asegurarse de tener instalado el cli de AWS, si no lo tiene instalado descarguelo y configure un usuario para usar el CLI local

#### API Gateway

Antes de hacer el despliegue del servicio hay que crear una Api Gateway simple, al crearla hacerlo sin ninguna ruta ni conexiones a ninguna lambda y con el stage "$default". Las rutas se crearán automáticamente al desplegar esta la lambda.

Tengo que copiarme el id de la api gateway para agregarlo a las variables de entorno.

#### Variables de entorno

> Debe tener creada una base de datos de mongo, en mi caso la cree en [Mongo Atlas](https://account.mongodb.com/) y crear un usuario para poder usar esta base de datos ("Security" -> "Database Access" -> "Add new database user" -> _Crea nombre de usuario con contraseña_ -> "Role"="Atlas admin" -> "Restrict Access to Specific Clusters/Federated Database Instances/Stream Processing Instances"=_selecciona db creada_).

Crear archivo `.env.prod` y configurar las variables de entorno necesarias para produccion

- MONGO_URI=... (string de conexion a base de datos de MongoDB con su nombre de usuario y contraseña)
- API_GATEWAY_ID= (id de api gateway creado)
- POSTS_FUNCTION_NAME= (Si ya se sabe el nombre de la lambda de posts agregarlo en este archivo, sino configurarlo despues en consola de aws)

#### Permisos

Una vez desplegado este servicio configurar los permisos de la lambda para que otras lambdas puedan invocarla.

Para esto ir a "Configuration" -> "Permissions" -> "Resource-based policy statements" -> "Add permission" -> Se le asigna nombre al permiso, se agrega la arn **del rol de la lambda que haria la invocacion a esta _(en este caso la arn del permiso de la lambda de posts)_**, y selecciono el permiso al que se le da acceso: **lambda:invokeFunction**.

De esta forma esta lambda puede ser invokada por cualquier lambda que tenga el rol seleccionado (en este caso la lambda de posts)

#### Deploy

    pnpm sls:prod
