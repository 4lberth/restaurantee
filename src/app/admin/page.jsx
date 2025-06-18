export const dynamic = 'force-dynamic';

export default function AdminHome() {
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
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-orange-300 text-xs">8 libres, 4 ocupadas</p>
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
              <p className="text-3xl font-bold text-white">45</p>
              <p className="text-red-300 text-xs">6 categorías</p>
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
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-orange-300 text-xs">2 admin, 5 mozos, 1 cocina</p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-3xl font-bold text-white">24</p>
              <p className="text-red-300 text-xs">S/ 1,450 facturado</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de accesos rápidos */}
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

        {/* Actividad reciente */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Mesa 5 liberada</p>
                <p className="text-gray-400 text-xs">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Nuevo plato agregado: "Lomo Saltado"</p>
                <p className="text-gray-400 text-xs">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Usuario "Carlos M." creado</p>
                <p className="text-gray-400 text-xs">Hace 1 hora</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Mesa 3 ocupada</p>
                <p className="text-gray-400 text-xs">Hace 2 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}