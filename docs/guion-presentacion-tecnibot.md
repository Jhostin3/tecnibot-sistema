# Guion de presentacion TecniBot

## Objetivo

Este guion acompana el archivo `scripts/demo-presentacion.playwright.mjs` para
mostrar el flujo completo de la plataforma TecniBot durante una exposicion.

## Orden recomendado

1. `Login`
   Explica que el sistema separa accesos por rol y que tambien existe una
   consulta publica de la llave sin autenticacion.

2. `Llave publica`
   Muestra que visitantes, docentes o asistentes pueden revisar el avance del
   torneo sin entrar al panel interno.

3. `Dashboard del organizador`
   Presenta el panel principal y comenta que desde aqui se define el modo de
   sorteo y se centraliza la operacion del torneo.

4. `Equipos`
   Explica que los equipos pueden cargarse por importacion CSV o por registro
   manual, y que desde esta pantalla tambien se editan o eliminan registros.

5. `Homologacion`
   Menciona que aqui se revisa el estado tecnico de cada robot, se filtran
   equipos por subcategoria y se aprueban o rechazan con observaciones.

6. `Sorteo`
   Explica que el sistema soporta sorteo virtual con ruleta o sorteo presencial
   con numero de bola, segun la configuracion del torneo.

7. `Brackets`
   Resalta que cada subcategoria genera su propia llave y que el sistema deja
   lista la visualizacion del bracket completo.

8. `Partidos`
   Explica que despues de homologar y realizar el sorteo, el sistema muestra
   directamente los partidos en el orden correspondiente.

9. `Modulo juez`
   Cierra con el flujo operativo en cancha: el juez entra al partido activo,
   usa el cronometro y registra el resultado oficial.

## Texto corto sugerido

TecniBot organiza todo el torneo desde un mismo sistema. Empezamos con el
acceso por roles y con una vista publica para que cualquiera pueda seguir la
llave. Luego pasamos al panel interno, donde el organizador administra equipos,
supervisa la homologacion tecnica, ejecuta el sorteo y genera los brackets.
Despues de eso, el sistema presenta directamente los partidos en el orden del
torneo y finalmente entramos al modulo del juez, donde se controla el tiempo
del encuentro y se registra el marcador oficial.

## Variables para la demo automatizada

```powershell
$env:BASE_URL="http://localhost:5173"
$env:ORGANIZER_EMAIL="organizador@tecnibot.com"
$env:ORGANIZER_PASSWORD="12345678"
$env:JUDGE_EMAIL="juez@tecnibot.com"
$env:JUDGE_PASSWORD="12345678"
$env:PUBLIC_SUBCATEGORY="Soccer"
node .\scripts\demo-presentacion.playwright.mjs
```

## Nota

Si Playwright aun no esta instalado en el proyecto, instala primero:

```powershell
npm install -D playwright
```
