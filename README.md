<h1 align="center">
SIVA FRONTEND
</h1>

## Asignacion de usuarios en evaluacion de capacidades

El modal de acciones del flujo de aprobacion muestra una fila por cada elemento de
`accionesAprobacion.roles_disponibles_asignar`, con las columnas **Rol** y
**Asignar usuario**. Cada selector contiene los usuarios disponibles de su rol.

Al confirmar la accion, los roles seleccionados se guardan en
`accionesAprobacion.roles_asignados` con este formato:

```json
[
  {
    "rol": "PUNTO FOCAL UER",
    "rol_id": 16,
    "users": [{ "user_id": 117, "name": "Usuario seleccionado" }]
  }
]
```

Los roles sin seleccion no se incluyen. Al reabrir el modal se recuperan las
asignaciones existentes si el usuario sigue disponible. Cancelar no modifica las
asignaciones ni ejecuta la accion.

El modal tambien admite la respuesta `"[]"` (texto) que devuelve actualmente la
API cuando no hay roles disponibles, ademas de `[]`, `null` o la propiedad ausente.
En estos casos no se muestra la tabla de asignacion.
