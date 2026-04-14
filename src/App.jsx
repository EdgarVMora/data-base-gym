import './App.css'
import { useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  useEffect(() => {
    async function testConnection() {
      console.log("Intentando conectar a Supabase Local...")
      // Hacemos una consulta inofensiva solo para probar si hay conexión
      const { data, error } = await supabase.from('cualquier_tabla').select('*').limit(1)

      if (error) {
        console.log("Respuesta recibida (Es normal si dice 'relation does not exist' o un error de permisos, significa que la conexión FUNCIONA):", error.message)
      } else {
        console.log("¡Conectado! Datos:", data)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Saiya Gym - Conectando...</h1>
      <p className="ml-4 text-gray-400">(Abre la consola del navegador con F12)</p>
    </div>
  )
}

export default App