<h1 align="center">
SIVA FRONTEND
</h1>

## Recuperacion de sesion al iniciar

El arranque inicializa MSAL y procesa el retorno de Microsoft antes de consultar
el usuario y el menu protegido. La renovacion de tokens sigue a cargo del
interceptor de MSAL; no es necesario borrar el cache del navegador.

La carga inicial y las peticiones del menu tienen un limite de 30 segundos.
Si falla la autenticacion, la traduccion o el menu, la pantalla de carga muestra
un error con el boton **Reintentar**, que recarga sin eliminar las sesiones ni
otros datos del navegador. Los detalles del error quedan en la consola.

Pruebas de regresion del arranque, aisladas de las pruebas de otros modulos:

```shell
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.bootstrap.spec.json --include=src/app/core/bootstrap/startup.service.spec.ts --include=src/app/core/bootstrap/translate-lang.service.spec.ts
```

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
