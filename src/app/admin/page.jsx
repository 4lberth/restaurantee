'use client';
import { useEffect, useState } from 'react';
import { listarMesas } from '@/lib/api/mozo';
import { listarPlatos } from '@/lib/api/mozo';
import { listarCategorias } from '@/lib/api/categorias';

export const dynamic = 'force-dynamic';

export default function AdminHome() {
  // Estados para los datos
  const [mesas, setMesas] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    pedidos: 0,
    facturado: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para cargar todos los datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Usar tus funciones de API existentes
        const mesasData = await listarMesas();
        const platosData = await listarPlatos({ soloDisponibles: false }); // Todos los platos
        const categoriasData = await listarCategorias(); // Usar tu función existente
        
        // Llamada directa a la API de usuarios
        const usuariosResponse = await fetch('/api/usuarios', { credentials: 'include' });
        const usuariosData = usuariosResponse.ok ? await usuariosResponse.json() : [];
        
        // Obtener estadísticas de hoy usando tu API de historial
        const hoy = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        const estadisticasResponse = await fetch(`/api/ordenes/historial?desde=${hoy}&hasta=${hoy}`, { 
          credentials: 'include' 
        });
        
        let estadisticasData = { pedidos: 0, facturado: 0 };
        if (estadisticasResponse.ok) {
          const ordenesHoy = await estadisticasResponse.json();
          
          estadisticasData = {
            pedidos: ordenesHoy.length,
            facturado: ordenesHoy.reduce((total, orden) => {
              // Cada orden ya tiene su total calculado
              const totalOrden = Number(orden.total) || 0;
              return total + totalOrden;
            }, 0)
          };
        }

        // Obtener actividades recientes
        const actividadesResponse = await fetch('/api/actividades', { credentials: 'include' });
        const actividadesData = actividadesResponse.ok ? await actividadesResponse.json() : [];

        setMesas(mesasData);
        setPlatos(platosData);
        setCategorias(categoriasData);
        setUsuarios(usuariosData);
        setActividades(actividadesData);
        setEstadisticasHoy(estadisticasData);
        
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cálculos basados en datos reales (solo si los datos están cargados)
  const mesasLibres = mesas.filter(m => m.estado === 'libre').length;
  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length;
  const totalMesas = mesas.length;

  const usuariosPorRol = usuarios.reduce((acc, user) => {
    acc[user.rol] = (acc[user.rol] || 0) + 1;
    return acc;
  }, {});

  // Usar el conteo real de categorías desde la API
  const totalCategorias = categorias.length;

  // Funciones helper para actividades
  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const actividad = new Date(fecha);
    const diffMs = ahora - actividad;
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) return 'Ahora mismo';
    if (diffMinutos < 60) return `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
  };

  const getColorActividad = (tipo) => {
    const colores = {
      mesa_creada: 'bg-blue-400',
      mesa_liberada: 'bg-green-400',
      mesa_ocupada: 'bg-blue-400',
      mesa_actualizada: 'bg-yellow-400',
      mesa_eliminada: 'bg-gray-400',
      plato_creado: 'bg-orange-400',
      plato_actualizado: 'bg-yellow-400',
      plato_eliminado: 'bg-gray-400',
      usuario_creado: 'bg-red-400',
      usuario_actualizado: 'bg-yellow-400',
      usuario_eliminado: 'bg-gray-400',
      orden_creada: 'bg-purple-400',
      orden_actualizada: 'bg-yellow-400',
      orden_completada: 'bg-emerald-400',
      orden_cancelada: 'bg-red-400',
      orden_estado_cambiado: 'bg-blue-400',
      categoria_creada: 'bg-indigo-400',
      categoria_actualizada: 'bg-yellow-400',
      categoria_eliminada: 'bg-gray-400'
    };
    return colores[tipo] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-gray-400">
          Gestiona tu restaurante de manera eficiente. Bienvenido al panel de administración.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Mesas */}
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur border border-orange-500/30 rounded-xl p-6 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">Mesas</p>
              <p className="text-3xl font-bold text-white">{totalMesas}</p>
              <p className="text-orange-300 text-xs">{mesasLibres} libres, {mesasOcupadas} ocupadas</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Platos */}
        <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur border border-red-500/30 rounded-xl p-6 hover:from-red-500/30 hover:to-orange-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm font-medium">Platos</p>
              <p className="text-3xl font-bold text-white">{platos.length}</p>
              <p className="text-red-300 text-xs">{totalCategorias} categorías</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Usuarios */}
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur border border-orange-600/30 rounded-xl p-6 hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">Usuarios</p>
              <p className="text-3xl font-bold text-white">{usuarios.length}</p>
              <p className="text-orange-300 text-xs">
                {usuariosPorRol.admin || 0} admin, {usuariosPorRol.mozo || 0} mozos, {usuariosPorRol.cocina || 0} cocina
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Pedidos Hoy */}
        <div className="bg-gradient-to-br from-red-600/20 to-orange-500/20 backdrop-blur border border-red-600/30 rounded-xl p-6 hover:from-red-600/30 hover:to-orange-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm font-medium">Pedidos Hoy</p>
              <p className="text-3xl font-bold text-white">{estadisticasHoy.pedidos}</p>
              <p className="text-red-300 text-xs">S/ {estadisticasHoy.facturado.toLocaleString()} facturado</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vista detallada de mesas */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Estado de Mesas</h2>
          <a 
            href="/admin/mesas" 
            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
          >
            Ver todas →
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`h-16 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 ${
                mesa.estado === 'libre'
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400'
                  : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400'
              }`}
            >
              <span className="font-bold">Mesa {mesa.numero}</span>
              <span className="text-xs opacity-75">
                {mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}
              </span>
            </div>
          ))}
        </div>

        {/* Leyenda de mesas */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded"></div>
            <span className="text-gray-300">Mesa libre</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded"></div>
            <span className="text-gray-300">Mesa ocupada</span>
          </div>
        </div>
      </div>

      {/* Sección de accesos rápidos y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accesos rápidos */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Accesos Rápidos</h2>
          <div className="space-y-3">
            <a href="/admin/mesas" className="flex items-center p-3 bg-gray-700/50 hover:bg-orange-500/20 hover:border-orange-500/50 border border-gray-600 rounded-lg transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Gestionar Mesas</p>
                <p className="text-gray-400 text-sm">Ver estado y administrar mesas</p>
              </div>
            </a>

            <a href="/admin/platos" className="flex items-center p-3 bg-gray-700/50 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-600 rounded-lg transition-all duration-200 group">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-500/30">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Administrar Platos</p>
                <p className="text-gray-400 text-sm">Crear y editar menú</p>
              </div>
            </a>

            <a href="/admin/usuarios" className="flex items-center p-3 bg-gray-700/50 hover:bg-orange-600/20 hover:border-orange-600/50 border border-gray-600 rounded-lg transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-600/30">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Gestionar Usuarios</p>
                <p className="text-gray-400 text-sm">Administrar personal y roles</p>
              </div>
            </a>
          </div>
        </div>

        {/* Actividad reciente - MEJORADA */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
            {actividades.length > 4 && (
              <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                {actividades.length} total
              </span>
            )}
          </div>
          
          {/* Contenedor con scroll - altura fija para 4 items */}
          <div className="h-80 overflow-y-auto scrollbar-actividades">
            <div className="space-y-3 pr-2">
              {actividades.length > 0 ? (
                actividades.map((actividad, index) => {
                  const tiempoTranscurrido = formatearTiempo(actividad.createdAt);
                  const color = getColorActividad(actividad.tipo);
                  
                  return (
                    <div 
                      key={actividad.id} 
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50 ${
                        index < 4 ? 'bg-gray-700/30' : 'bg-gray-700/20'
                      }`}
                    >
                      <div className={`w-2 h-2 ${color} rounded-full mr-3 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm leading-relaxed">{actividad.mensaje}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-400 text-xs">{tiempoTranscurrido}</p>
                          {actividad.usuario && (
                            <span className="text-xs text-gray-500 bg-gray-600/30 px-2 py-0.5 rounded">
                              {actividad.usuario.nombre}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">No hay actividad reciente</p>
                    <p className="text-gray-500 text-xs">Las actividades aparecerán aquí cuando uses el sistema</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de scroll si hay más de 4 actividades */}
          {actividades.length > 4 && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <p className="text-center text-xs text-gray-500">
                ↑ Desplázate para ver más actividades ↑
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}