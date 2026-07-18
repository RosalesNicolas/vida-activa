# Vida Activa

Aplicación web full stack para la gestión de clientes, rutinas de entrenamiento, mediciones físicas, seguimientos y notificaciones de un entrenador personal.

El proyecto incluye:

- una landing page pública;
- un panel privado para el administrador;
- un panel privado para cada cliente;
- autenticación y autorización por roles;
- seguimiento integral de la evolución de los clientes.

## Funcionalidades principales

### Administrador

El administrador puede:

- iniciar sesión mediante autenticación JWT;
- consultar un dashboard general;
- crear nuevos clientes;
- buscar y paginar clientes;
- editar los datos personales de los clientes;
- activar y desactivar cuentas;
- consultar perfiles completos;
- registrar, editar y eliminar mediciones físicas;
- visualizar gráficos de evolución corporal;
- crear rutinas de entrenamiento;
- editar la rutina activa;
- consultar el historial de rutinas;
- activar nuevamente una rutina anterior;
- agregar ejercicios, series, repeticiones o tiempos;
- crear y editar seguimientos;
- consultar respuestas de clientes;
- habilitar nuevamente la edición de una respuesta;
- gestionar notificaciones internas;
- marcar notificaciones como leídas;
- marcar notificaciones como atendidas;
- reabrir notificaciones;
- consultar alertas automáticas;
- cambiar su contraseña;
- recuperar su contraseña mediante correo electrónico.

### Cliente

El cliente puede:

- iniciar sesión en su cuenta;
- consultar su dashboard personal;
- visualizar su rutina activa;
- consultar el historial de rutinas;
- registrar mediciones físicas;
- editar sus mediciones;
- visualizar gráficos de evolución;
- consultar seguimientos;
- responder comentarios del entrenador;
- editar su perfil personal;
- cambiar su contraseña;
- recuperar su contraseña por correo electrónico.

## Notificaciones

El sistema genera notificaciones cuando:

- un cliente responde un seguimiento;
- un cliente registra una medición;
- un cliente actualiza su perfil.

También genera alertas automáticas cuando:

- un cliente no tiene una rutina activa;
- una rutina está próxima a vencer;
- una rutina está vencida;
- un cliente nunca registró mediciones;
- un cliente no registra mediciones recientes.

Las alertas por condición se resuelven automáticamente cuando deja de existir el problema.

Ejemplo:

```text
Cliente sin rutina activa
→ el administrador asigna una rutina
→ la alerta pasa automáticamente a resuelta
```

## Dashboards

### Dashboard del administrador

Muestra información como:

- cantidad de clientes activos;
- cantidad de clientes inactivos;
- cantidad total de clientes;
- rutinas activas;
- clientes sin rutina;
- clientes sin mediciones recientes;
- seguimientos en proceso;
- respuestas de clientes;
- últimos clientes registrados.

### Dashboard del cliente

Muestra:

- rutina activa;
- último peso registrado;
- cambio de peso;
- porcentaje de grasa corporal;
- última medición;
- último seguimiento;
- accesos rápidos;
- aviso de perfil incompleto.

## Tecnologías utilizadas

### Backend

- Node.js
- Express 5
- Sequelize
- SQLite
- JSON Web Token
- bcryptjs
- Nodemailer
- express-rate-limit
- express-validator
- dotenv
- CORS
- Nodemon

### Frontend

- React 19
- React DOM
- React Router
- Axios
- Bootstrap 5
- Vite
- ESLint

## Dependencias

### Backend

| Dependencia | Versión |
|---|---:|
| bcryptjs | ^3.0.3 |
| cors | ^2.8.6 |
| dotenv | ^17.4.2 |
| express | ^5.2.1 |
| express-rate-limit | ^8.6.0 |
| express-validator | ^7.3.2 |
| jsonwebtoken | ^9.0.3 |
| nodemailer | ^9.0.3 |
| sequelize | ^6.37.8 |
| sqlite3 | ^6.0.1 |

### Dependencia de desarrollo del backend

| Dependencia | Versión |
|---|---:|
| nodemon | ^3.1.14 |

### Frontend

| Dependencia | Versión |
|---|---:|
| axios | ^1.18.1 |
| bootstrap | ^5.3.8 |
| react | ^19.2.7 |
| react-dom | ^19.2.7 |
| react-router-dom | ^7.18.1 |

### Dependencias de desarrollo del frontend

| Dependencia | Versión |
|---|---:|
| @eslint/js | ^10.0.1 |
| @types/react | ^19.2.17 |
| @types/react-dom | ^19.2.3 |
| @vitejs/plugin-react | ^6.0.3 |
| eslint | ^10.6.0 |
| eslint-plugin-react-hooks | ^7.1.1 |
| eslint-plugin-react-refresh | ^0.5.3 |
| globals | ^17.7.0 |
| vite | ^8.1.1 |

## Arquitectura general

La aplicación está dividida en dos proyectos:

```text
fitcoach-project/
├── backend/
├── frontend/
├── docs/
├── .gitignore
└── README.md
```

### Backend

```text
backend/
├── src/
│   ├── config/
│   ├── database/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── dashboard/
│   │   ├── measurements/
│   │   ├── notifications/
│   │   ├── progress/
│   │   ├── routines/
│   │   └── users/
│   ├── services/
│   ├── app.js
│   └── server.js
├── nodemon.json
├── package.json
└── package-lock.json
```

### Frontend

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── features/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── client/
│   │   ├── errors/
│   │   ├── landing/
│   │   └── measurements/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── package-lock.json
└── vite.config.js
```

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js;
- npm;
- Git.

Comprobar las instalaciones:

```bash
node --version
npm --version
git --version
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/TU_USUARIO/vida-activa.git
cd vida-activa
```

### Instalar el backend

```bash
cd backend
npm install
```

### Instalar el frontend

En otra terminal:

```bash
cd frontend
npm install
```

## Variables de entorno

Crear el siguiente archivo:

```text
backend/.env
```

Ejemplo:

```env
PORT=3000
NODE_ENV=development

DB_STORAGE=./src/database/fitcoach.sqlite

JWT_SECRET=reemplazar_por_una_clave_larga_y_segura

FRONTEND_URL=http://localhost:5173

ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@ejemplo.com
ADMIN_PASSWORD=reemplazar_por_una_contraseña_segura

EMAIL_HOST=smtp.ejemplo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=correo@ejemplo.com
EMAIL_PASSWORD=clave_o_contraseña_de_aplicacion
EMAIL_FROM=correo@ejemplo.com
```

El archivo `.env` contiene información privada y no debe subirse al repositorio.

## Variables disponibles

| Variable | Descripción |
|---|---|
| PORT | Puerto del backend |
| NODE_ENV | Entorno de ejecución |
| DB_STORAGE | Ubicación del archivo SQLite |
| JWT_SECRET | Clave usada para firmar tokens |
| FRONTEND_URL | URL permitida para el frontend |
| ADMIN_NAME | Nombre inicial del administrador |
| ADMIN_EMAIL | Correo inicial del administrador |
| ADMIN_PASSWORD | Contraseña inicial del administrador |
| EMAIL_HOST | Servidor SMTP |
| EMAIL_PORT | Puerto SMTP |
| EMAIL_SECURE | Uso de conexión segura SMTP |
| EMAIL_USER | Usuario del servicio de correo |
| EMAIL_PASSWORD | Contraseña o clave de aplicación |
| EMAIL_FROM | Dirección utilizada como remitente |

## Crear el administrador inicial

Después de configurar `backend/.env`, ejecutar desde la carpeta `backend`:

```bash
npm run seed:admin
```

El proceso:

- crea un administrador si no existe;
- actualiza el rol si el usuario ya existe;
- activa la cuenta;
- no muestra la contraseña en la consola.

No se incluyen credenciales reales en el repositorio.

## Ejecutar el proyecto

### Backend

Desde la carpeta `backend`:

```bash
npm run dev
```

El backend queda disponible en:

```text
http://localhost:3000
```

Endpoint para comprobar su funcionamiento:

```text
http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Backend Vida Activa funcionando correctamente"
}
```

### Frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

El frontend queda disponible en:

```text
http://localhost:5173
```

## Scripts disponibles

### Backend

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Crear o actualizar el administrador:

```bash
npm run seed:admin
```

### Frontend

Modo desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Ejecutar ESLint:

```bash
npm run lint
```

Visualizar el build:

```bash
npm run preview
```

## Roles del sistema

### Administrador

El administrador puede gestionar:

- clientes;
- perfiles;
- rutinas;
- ejercicios;
- mediciones;
- seguimientos;
- dashboards;
- notificaciones;
- alertas.

### Cliente

El cliente puede consultar y modificar únicamente la información autorizada de su propia cuenta.

## Seguridad

El proyecto incluye:

- autenticación mediante JWT;
- contraseñas cifradas con bcrypt;
- autorización por roles;
- rutas protegidas en frontend y backend;
- control de usuarios activos e inactivos;
- invalidación de sesiones mediante versión del token;
- limitación de intentos en rutas de autenticación;
- recuperación de contraseña mediante tokens temporales;
- validación de datos;
- exclusión de archivos privados mediante `.gitignore`.

## Base de datos

Durante el desarrollo se utiliza SQLite.

La ubicación predeterminada es:

```text
backend/src/database/fitcoach.sqlite
```

El archivo de base de datos no se incluye en el repositorio.

Esto evita publicar:

- datos personales;
- contraseñas cifradas;
- mediciones;
- rutinas;
- seguimientos;
- tokens;
- notificaciones.

## Módulos principales

### Autenticación

- login;
- recuperación de contraseña;
- cambio de contraseña;
- validación JWT;
- control de sesiones.

### Clientes

- creación;
- consulta;
- búsqueda;
- paginación;
- edición;
- activación;
- desactivación;
- perfiles ampliados.

### Mediciones

- creación;
- edición;
- eliminación por administrador;
- paginación;
- consulta individual;
- evolución física;
- gráficos.

### Rutinas

- creación;
- edición;
- ejercicios;
- versiones;
- historial;
- activación;
- una única rutina activa por cliente.

### Seguimientos

- creación;
- edición;
- estados;
- comentarios;
- respuesta del cliente;
- bloqueo y habilitación de edición;
- paginación.

### Notificaciones

- eventos;
- alertas automáticas;
- lectura;
- atención;
- reapertura;
- resolución automática;
- filtros;
- paginación;
- contador de no leídas.

## Estados de las notificaciones

### No leída

El administrador todavía no abrió la notificación.

### Leída

El administrador abrió la notificación, pero todavía puede estar pendiente.

### Atendida

El administrador realizó la acción correspondiente y la marcó manualmente como atendida.

### Resuelta automáticamente

La condición que produjo la alerta dejó de existir.

## Validaciones implementadas

Entre otras validaciones, el sistema controla:

- campos obligatorios;
- formato de correo electrónico;
- correos duplicados;
- contraseñas;
- fechas de nacimiento futuras;
- fechas finales anteriores a fechas iniciales;
- mediciones numéricas mayores que cero;
- existencia de clientes;
- acceso por rol;
- propiedad de los recursos;
- una sola rutina activa;
- respuestas vacías;
- longitud máxima de respuestas;
- estados permitidos.

## Documentación adicional

La carpeta `docs` contiene información complementaria sobre:

- alcance;
- reglas de negocio;
- componentes del frontend;
- decisiones técnicas;
- estructura de la landing;
- ideas;
- tareas pendientes.

## Capturas de pantalla

Las capturas del sistema pueden agregarse más adelante en una carpeta:

```text
docs/screenshots/
```

Ejemplo de uso en este README:

```markdown
![Dashboard del administrador](docs/screenshots/admin-dashboard.png)
```

## Estado actual

La versión actual incluye:

- landing page pública;
- autenticación;
- recuperación de contraseña;
- gestión de clientes;
- perfiles;
- mediciones;
- gráficos de evolución;
- rutinas;
- historial de rutinas;
- seguimientos;
- respuestas de clientes;
- dashboards;
- notificaciones;
- alertas automáticas;
- filtros;
- paginación;
- validaciones;
- diseño adaptable.

## Mejoras futuras

- migración de SQLite a PostgreSQL;
- despliegue del backend;
- despliegue del frontend;
- pruebas automáticas;
- integración continua;
- almacenamiento de imágenes;
- carga de fotografías de evolución;
- optimización del bundle;
- mejoras de accesibilidad;
- notificaciones operativas por correo;
- aplicación móvil;
- gestión colaborativa de múltiples administradores;
- asignación de tareas entre entrenadores.

## Propósito

Vida Activa fue desarrollado como:

- proyecto educativo;
- práctica de desarrollo full stack;
- proyecto de portfolio;
- base para una aplicación real;
- demostración de conocimientos en React, Node.js, Express, Sequelize, autenticación y diseño de APIs REST.

## Autor

Proyecto desarrollado por Nicolás.

## Licencia

Este proyecto se publica con fines educativos y de portfolio.

Todavía no se ha definido una licencia de distribución específica.
