import path from 'node:path'

import { chromium } from 'playwright'

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173'
const pauseMs = Number(process.env.DEMO_PAUSE_MS ?? 1800)
const slowMo = Number(process.env.DEMO_SLOWMO_MS ?? 250)
const keepOpen = process.env.DEMO_KEEP_OPEN !== 'false'
const csvDemoPath = process.env.IMPORT_CSV_PATH
  ?? path.resolve(process.cwd(), 'Base', 'TECNIBOT_2026_Soccer_32_equipos.csv')

const credenciales = {
  juez: {
    correo: process.env.JUDGE_EMAIL ?? 'juez@tecnibot.com',
    contrasena: process.env.JUDGE_PASSWORD ?? '12345678',
  },
  organizador: {
    correo: process.env.ORGANIZER_EMAIL ?? 'organizador@tecnibot.com',
    contrasena: process.env.ORGANIZER_PASSWORD ?? '12345678',
  },
}

function logPaso(titulo, detalle = '') {
  const mensaje = detalle ? `${titulo}: ${detalle}` : titulo
  console.log(`\n[DEMO] ${mensaje}`)
}

async function pausa(page, titulo, ms = pauseMs) {
  logPaso('Pausa', titulo)
  await page.waitForTimeout(ms)
}

async function ir(page, ruta, titulo) {
  logPaso('Pantalla', `${titulo} -> ${ruta}`)
  await page.goto(`${baseUrl}${ruta}`, { waitUntil: 'networkidle' })
  await pausa(page, titulo)
}

async function clickSiExiste(locator, titulo) {
  if (await locator.count()) {
    logPaso('Interaccion', titulo)
    await locator.first().click()
    return true
  }

  return false
}

async function login(page, rol, { correo, contrasena }) {
  if (!correo || !contrasena) {
    logPaso('Omitido', `No se configuraron credenciales para ${rol}`)
    return false
  }

  await ir(page, '/login', `Login ${rol}`)
  await page.getByLabel(/Correo institucional/i).fill(correo)
  await page.getByLabel(/Contrase(?:n|ñ)a/i).fill(contrasena)
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click()
  await page.waitForLoadState('networkidle')
  await pausa(page, `Sesion iniciada como ${rol}`)
  return true
}

async function cerrarSesion(page) {
  const botonCerrarSesion = page.getByRole('button', { name: 'Cerrar sesion' })

  if (await botonCerrarSesion.count()) {
    logPaso('Interaccion', 'Cerrar sesion')
    await botonCerrarSesion.click()
    await page.waitForLoadState('networkidle')
    await pausa(page, 'Sesion cerrada')
  }
}

async function mostrarFlujoPublico(page) {
  await ir(page, '/login', 'Portada de acceso')
  await clickSiExiste(
    page.getByRole('button', { name: /Ver llave del torneo/i }),
    'Abrir llave publica',
  )
  await page.waitForLoadState('networkidle')
  await pausa(page, 'Vista publica del bracket')

  const nombreSubcategoria = process.env.PUBLIC_SUBCATEGORY

  if (nombreSubcategoria) {
    await clickSiExiste(
      page.getByRole('button', { name: new RegExp(nombreSubcategoria, 'i') }),
      `Seleccionar subcategoria publica: ${nombreSubcategoria}`,
    )
    await pausa(page, 'Bracket publico filtrado')
  }

  await ir(page, '/login', 'Retorno al acceso principal')
}

async function mostrarFlujoOrganizador(page) {
  const sesionActiva = await login(page, 'organizador', credenciales.organizador)

  if (!sesionActiva) return

  await ir(page, '/', 'Dashboard del organizador')

  await ir(page, '/equipos', 'Gestion de equipos')
  const selectorArchivo = page.locator('input[type="file"]')
  if (await selectorArchivo.count()) {
    logPaso('Interaccion', `Cargar CSV de prueba: ${csvDemoPath}`)
    await selectorArchivo.setInputFiles(csvDemoPath)
    await pausa(page, 'Archivo CSV seleccionado')

    await clickSiExiste(
      page.getByRole('button', { name: 'Procesar archivo' }),
      'Procesar archivo CSV',
    )
    await page.waitForLoadState('networkidle')
    await pausa(page, 'Vista previa de importacion')

    await clickSiExiste(
      page.getByRole('button', { name: 'Confirmar importacion' }),
      'Confirmar importacion de equipos',
    )
    await page.waitForLoadState('networkidle')
    await pausa(page, 'Equipos importados')
  }

  const botonCrearEquipo = page.getByRole('button', { name: 'Crear equipo' })
  if (await clickSiExiste(botonCrearEquipo, 'Abrir formulario de creacion')) {
    await pausa(page, 'Formulario manual de equipos')
    await clickSiExiste(page.getByRole('button', { name: 'Cancelar' }), 'Cerrar formulario')
    await pausa(page, 'Retorno al listado de equipos')
  }

  await ir(page, '/homologacion', 'Homologacion tecnica')
  const campoBusqueda = page.getByPlaceholder(/Buscar por equipo/i)
  if (await campoBusqueda.count()) {
    logPaso('Interaccion', 'Mostrar filtro de busqueda')
    await campoBusqueda.fill('robot')
    await pausa(page, 'Busqueda aplicada')
    await campoBusqueda.clear()
  }
  await clickSiExiste(
    page.getByRole('button', { name: 'Homologados' }),
    'Cambiar a pestaña de homologados',
  )
  await pausa(page, 'Vista de equipos homologados')
  await clickSiExiste(
    page.getByRole('button', { name: 'Por revisar' }),
    'Regresar a pestaña por revisar',
  )

  await ir(page, '/sorteo', 'Sorteo y ruleta')
  await pausa(page, 'Panel de seleccion de categoria y subcategoria')

  await ir(page, '/brackets', 'Listado de brackets')
  await pausa(page, 'Consulta de llaves generadas')

  await ir(page, '/partidos', 'Partidos generados en orden')
  await pausa(page, 'Visualizacion directa del orden de partidos')
}

async function mostrarFlujoJuez(page) {
  await cerrarSesion(page)

  const sesionActiva = await login(page, 'juez', credenciales.juez)

  if (!sesionActiva) return

  await ir(page, '/juez', 'Modulo de juez')
  const botonIniciarPartido = page.getByRole('button', { name: 'Iniciar partido' })

  if (await clickSiExiste(botonIniciarPartido, 'Entrar a un partido activo')) {
    await page.waitForLoadState('networkidle')
    await pausa(page, 'Pantalla del partido')
    await clickSiExiste(
      page.getByRole('button', { name: 'Iniciar primer tiempo' }),
      'Mostrar cronometro del partido',
    )
    await pausa(page, 'Timer y controles del arbitro', 2500)
    await page.goto(`${baseUrl}/juez`, { waitUntil: 'networkidle' })
    await pausa(page, 'Regreso al tablero del juez')
  }
}

async function main() {
  logPaso('Inicio', `Base URL ${baseUrl}`)
  const browser = await chromium.launch({
    headless: false,
    slowMo,
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  try {
    await mostrarFlujoPublico(page)
    await mostrarFlujoOrganizador(page)
    await mostrarFlujoJuez(page)
    logPaso('Fin', 'Presentacion completada')
    if (keepOpen) {
      logPaso('Revision manual', 'La ventana quedara abierta. Presiona Ctrl+C en la terminal para terminar.')
      await page.waitForTimeout(60 * 60 * 1000)
    } else {
      await pausa(page, 'Cierre visual final', 2500)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error('\n[DEMO] Error durante la presentacion')
  console.error(error)
  process.exit(1)
})

