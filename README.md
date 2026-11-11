<h1 align="center">
SIVA FRONTEND
</h1>

## Recuperacion de sesion al iniciar

El arranque inicializa MSAL y procesa el retorno de Microsoft antes de consultar
el usuario y el menu protegido. La renovacion de tokens sigue a cargo del
interceptor de MSAL; no es necesario borrar el cache del navegador.

Se usa `MsalService.handleRedirectObservable()` para liberar tambien el estado
`Startup` de MSAL Angular cuando no hay un retorno pendiente. Una llamada directa
a `handleRedirectPromise()` no realiza ese paso: tras un fallo de renovacion,
el interceptor puede esperar indefinidamente sin enviar la peticion al backend.
En MSAL 5, los retornos de autenticacion en iframe o popup se entregan mediante
`broadcastResponseToMainFrame()` antes de arrancar Angular, reutilizando la URI
de retorno configurada. La navegacion normal sigue usando el wrapper de Angular.

La carga inicial y las peticiones del menu tienen un limite de 30 segundos.
El limite de la solicitud se aplica antes del cache compartido; al fallar se
invalida ese cache y al retirarse el ultimo consumidor se cancela la suscripcion
pendiente. Una finalizacion sin respuesta tambien se notifica como error.
La adquisicion o renovacion de un token no recarga el menu: hacerlo desde
`ACQUIRE_TOKEN_SUCCESS` puede cancelar y reiniciar la misma solicitud protegida.
Si falla la autenticacion, la traduccion o el menu, la pantalla de carga muestra
un error con el boton **Reintentar**, que recarga sin eliminar las sesiones ni
otros datos del navegador. Los detalles del error quedan en la consola.

Al completar el arranque, la capa de carga deja de interceptar clics
inmediatamente y programa su ocultamiento con un temporizador de 600 ms sin depender de
`transitionend`, que puede no emitirse en pestanas ocultas o sin animaciones.

Pruebas de regresion del arranque, aisladas de las pruebas de otros modulos:

```shell
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.bootstrap.spec.json --include=src/app/core/bootstrap/*.spec.ts --include=src/app/core/authentication/login.service.spec.ts --include=src/app/core/authentication/auth-response.spec.ts --include=src/app/core/authentication/auth-session.spec.ts
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
