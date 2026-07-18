# Vida Activa - Reglas de Negocio

Versión: 0.1
Estado: En construcción

---

# 1. Usuarios

## 1.1 Roles

El sistema posee dos roles:

- Administrador
- Cliente

---

## 1.2 Administrador

El administrador puede:

- Crear clientes.
- Editar clientes.
- Activar y desactivar clientes.
- Ver todos los clientes.
- Crear rutinas.
- Editar rutinas.
- Activar y desactivar rutinas.
- Crear mediciones.
- Editar mediciones.
- Eliminar mediciones.
- Crear notas de seguimiento.
- Editar notas.
- Eliminar notas.
- Visualizar todas las estadísticas.

---

## 1.3 Cliente

El cliente puede:

- Iniciar sesión.
- Ver su perfil.
- Ver sus rutinas.
- Ver sus mediciones.
- Ver sus notas de seguimiento visibles.
- Registrar sus propias mediciones.
- Editar y eliminar únicamente sus propias mediciones.

Nunca puede acceder a información de otros clientes.

---

# 2. Clientes

- Un cliente nunca se elimina físicamente.
- Los clientes pueden activarse y desactivarse.
- Un cliente inactivo no puede iniciar sesión.
- Todo cliente posee un usuario asociado.

---

# 3. Rutinas

## Actualización: funcionamiento de las rutinas

- Una rutina está compuesta por ejercicios estructurados.
- Cada ejercicio puede incluir:
  - orden;
  - día de la semana opcional;
  - nombre;
  - cantidad de series;
  - cantidad de repeticiones o segundos;
  - tipo de unidad;
  - observaciones.
- Un cliente puede tener como máximo una rutina activa.
- Al crear una nueva rutina, la rutina activa anterior se desactiva automáticamente.
- Una rutina desactivada permanece disponible en el historial.
- El administrador puede desactivar la rutina actual sin crear una nueva.
- Si la rutina actual es desactivada y no se crea otra, el cliente queda sin rutina activa.
- Las rutinas poseen un número de versión.
- El cliente puede consultar:
  - su rutina actual, si existe;
  - su historial de rutinas.
- Las rutinas no se eliminan físicamente.
- Adjuntar imágenes o videos queda registrado como mejora futura.

---

# 4. Mediciones

Las mediciones pueden ser cargadas por:

- el administrador;
- el propio cliente.

Toda medición posee:

- fecha;
- peso;
- cintura;
- pecho;
- brazo;
- pierna;
- porcentaje graso;
- observaciones.

El administrador puede editar cualquier medición.

El cliente únicamente puede editar o eliminar las mediciones que le pertenecen.

---

# 5. Seguimiento

Las notas de seguimiento son creadas por el administrador.

Cada nota posee:

- fecha;
- título;
- comentario;
- estado;
- próxima acción;
- visible para cliente.

El administrador decide si una nota es visible para el cliente.

---

# 6. Seguridad

Todas las rutas privadas requieren autenticación mediante JWT.

Los permisos dependen del rol del usuario autenticado.

---

# 7. Historial

El sistema prioriza conservar el historial antes que eliminar información.

Por este motivo:

- los clientes se desactivan;
- las rutinas se desactivan;
- solamente las mediciones y notas de seguimiento pueden eliminarse.

---

# 8. Estado del proyecto

Estas reglas podrán modificarse durante el desarrollo si el negocio lo requiere.
