import { useState } from 'react'
import './App.css'
import AppShell from './components/layout/AppShell'
import DashboardResumen from './components/DashboardResumen'
import ListaPersonas from './components/ListaPersonas'
import ListaClientes from './components/ListaClientes'
import ListaEmpleados from './components/ListaEmpleados'
import ListaMembresias from './components/ListaMembresias'
import ListaClienteMembresia from './components/ListaClienteMembresia'
import ListaPagos from './components/ListaPagos'
import ListaDetallePago from './components/ListaDetallePago'
import ListaInsumos from './components/ListaInsumos'
import ListaProveedores from './components/ListaProveedores'
import ListaEquipos from './components/ListaEquipos'
import ListaAreas from './components/ListaAreas'
import VistaClasesInscripciones from './components/VistaClasesInscripciones'
import VistaInstalaciones from './components/VistaInstalaciones'
import ListaRegistroAcceso from './components/ListaRegistroAcceso'
import ListaIncidencias from './components/ListaIncidencias'
import ListaNomina from './components/ListaNomina'
import VistaCatalogos from './components/VistaCatalogos'

function App() {
  const [seccion, setSeccion] = useState('resumen')

  let contenido = null
  switch (seccion) {
    case 'resumen':
      contenido = <DashboardResumen onNavigate={setSeccion} />
      break
    case 'personas':
      contenido = <ListaPersonas />
      break
    case 'clientes':
      contenido = <ListaClientes />
      break
    case 'empleados':
      contenido = <ListaEmpleados />
      break
    case 'membresias':
      contenido = <ListaMembresias />
      break
    case 'cliente_membresia':
      contenido = <ListaClienteMembresia />
      break
    case 'pagos':
      contenido = <ListaPagos />
      break
    case 'detalle_pago':
      contenido = <ListaDetallePago />
      break
    case 'clases':
      contenido = <VistaClasesInscripciones />
      break
    case 'instalaciones':
      contenido = <VistaInstalaciones />
      break
    case 'insumos':
      contenido = <ListaInsumos />
      break
    case 'equipos':
      contenido = <ListaEquipos />
      break
    case 'areas':
      contenido = <ListaAreas />
      break
    case 'proveedores':
      contenido = <ListaProveedores />
      break
    case 'accesos':
      contenido = <ListaRegistroAcceso />
      break
    case 'incidencias':
      contenido = <ListaIncidencias />
      break
    case 'nomina':
      contenido = <ListaNomina />
      break
    case 'catalogos':
      contenido = <VistaCatalogos />
      break
    default:
      contenido = <DashboardResumen onNavigate={setSeccion} />
  }

  return (
    <AppShell activeId={seccion} onNavigate={setSeccion}>
      {contenido}
    </AppShell>
  )
}

export default App
