# Angular template

Template de angular que contiene integración con AWS Cognito

## Tabla de Contenidos

- [Instalación](#instalación)
- [Rutas](#uso)
- [Características](#características)


## Instalación

### Prerrequisitos

Asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (versión 14.x o superior)
- [npm](https://www.npmjs.com/) (generalmente se instala con Node.js)
- [Angular CLI](https://cli.angular.io/) (versión 12.x o superior)

```bash
node -v
npm -v
ng version
```

### Sigue estos pasos para instalar y ejecutar el proyecto en tu entorno local.

Clona el proyecto

```bash
git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/angularTemplateBase
```

Instalar las dependencias
```
npm install
```


Corre la aplicacion
```
ng serve -o
```


## Rutas

Para agregar rutas debes de seguir una serie de pasos

### Agregar accesos a sidebar

Para mostrar los accesos que necesites en el sidebar debes seguir estos pasos:

*  ingresar al archivo **src\app\layouts\full\vertical\sidebar\sidebar-data.ts**


### Agregar rutas de la aplicación
Para agregar las rutas debes hacerlo en el siguiente archivo:
* src\app\app-routing.module.ts

en esta ruta puedes agregar las rutas que desees, dentro de este archivo hay instrucciones de como hacerlo exactamente
