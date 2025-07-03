'use client';
import { useEffect, useState } from 'react';
import {
  listarOrdenes,
  cambiarEstadoOrden,
  obtenerDetallesOrden,
} from '@/lib/api/ordenes';

// Componente Modal para mostrar detalles de la orden
function DetallesOrdenModal({ ordenId, onClose }) {
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ordenId) {
      cargarDetalles();
    }
  }, [ordenId]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const detalles = await obtenerDetallesOrden(ordenId);
      setOrden(detalles);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!ordenId) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      en_preparacion: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      listo: 'bg-green-500/20 text-green-400 border-green-500/30',
      servido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelada: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[estado] || styles.pendiente;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Detalles de Orden #{ordenId}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Cargando detalles...</div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : orden ? (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Información General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(orden.estado)}`}>
                        {orden.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mesa:</span>
                      <span className="text-white font-medium">Mesa {orden.mesa?.numero || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mozo:</span>
                      <span className="text-white">{orden.mozo?.nombre || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white font-bold">S/ {orden.total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creada:</span>
                      <span className="text-white text-sm">{formatearFecha(orden.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Cliente</h3>
                  {orden.cliente ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nombre:</span>
                        <span className="text-white">{orden.cliente.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">DNI:</span>
                        <span className="text-white">{orden.cliente.dni}</span>
                      </div>
                      {orden.cliente.telefono && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Teléfono:</span>
                          <span className="text-white">{orden.cliente.telefono}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Sin cliente asignado</p>
                  )}
                </div>
              </div>

              {/* Notas */}
              {orden.notas && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Notas</h3>
                  <p className="text-gray-300">{orden.notas}</p>
                </div>
              )}

              {/* Detalles de Platos */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Platos Ordenados</h3>
                <div className="space-y-3">
                  {orden.detalles && orden.detalles.length > 0 ? (
                    orden.detalles.map((detalle, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{detalle.plato?.nombre || `Plato ID: ${detalle.platoId}`}</p>
                          {detalle.plato?.descripcion && (
                            <p className="text-gray-400 text-sm">{detalle.plato.descripcion}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white">
                            <span className="font-medium">{detalle.cantidad}x</span>
                            <span className="ml-2">S/ {detalle.plato?.precio?.toFixed(2) || '0.00'}</span>
                          </p>
                          <p className="text-gray-400 text-sm">
                            Subtotal: S/ {detalle.subtotal?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No hay platos en esta orden</p>
                  )}
                </div>
              </div>

              {/* Tiempo transcurrido */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Tiempo</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400">Tiempo transcurrido:</span>
                    <span className="text-white ml-2 font-medium">
                      {Math.floor((new Date() - new Date(orden.createdAt)) / 60000)} minutos
                    </span>
                  </div>
                  {Math.floor((new Date() - new Date(orden.createdAt)) / 60000) > 30 && orden.estado === 'pendiente' && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      ⚠️ Urgente
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CocinaDashboard() {
  const [ordenes, setOrd] = useState([]);
  const [loading, setLoad] = useState(true);
  const [seleccion, setSel] = useState([]);
  const [busq, setBusq] = useState('');
  const [showListos, setShow] = useState(false);
  const [error, setErr] = useState('');
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState(null);

  /* cargar órdenes */
  useEffect(() => {
    (async () => {
      try {
        setOrd(await listarOrdenes());
      } catch (e) {
        setErr(e.message);
      }
      setLoad(false);
    })();
  }, []);

  /* selección */
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);
  const selectAll = () => {
    const ids = data.map(o => o.id);
    setSel(ids);
  };

  /* cambiar estado */
  const setEstado = async (estado) => {
    if (!seleccion.length) return;
    try {
      await Promise.all(seleccion.map(id => cambiarEstadoOrden(id, estado)));

      // Actualizar localmente sin recargar
      setOrd(o =>
        o.map(or =>
          seleccion.includes(or.id) ? { ...or, estado } : or
        )
      );
      clearSel();
    } catch (e) {
      alert(e.message);
    }
  };

  /* mostrar detalles */
  const mostrarDetalles = (ordenId) => {
    setOrdenSeleccionadaId(ordenId);
  };

  const cerrarModal = () => {
    setOrdenSeleccionadaId(null);
  };

  /* filtrado */
  const data = ordenes
    .filter(o =>
      showListos
        ? ['pendiente', 'en_preparacion', 'listo'].includes(o.estado)
        : ['pendiente', 'en_preparacion'].includes(o.estado)
    )
    .filter(o =>
      (o.mesa?.numero + (o.cliente?.nombre ?? '')).toLowerCase()
        .includes(busq.toLowerCase())
    );

  const getEstadoBadge = (estado) => {
    const styles = {
      pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      en_preparacion: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      listo: 'bg-green-500/20 text-green-400 border-green-500/30',
      servido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelada: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[estado] || styles.pendiente;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Panel de Cocina</h1>
        <p className="text-gray-400">Gestiona las órdenes pendientes y en preparación</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Activas</p>
              <p className="text-2xl font-bold text-white">{data.length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-white">
                {ordenes.filter(o => o.estado === 'pendiente').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm">en_preparacion</p>
              <p className="text-2xl font-bold text-white">
                {ordenes.filter(o => o.estado === 'en_preparacion').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Listas Hoy</p>
              <p className="text-2xl font-bold text-white">
                {ordenes.filter(o => o.estado === 'listo').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Acciones de estado */}
          <button
            onClick={() => setEstado('en_preparacion')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            disabled={!seleccion.length}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Preparar ({seleccion.length})
          </button>

          <button
            onClick={() => setEstado('listo')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            disabled={!seleccion.length}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Marcar como Listo ({seleccion.length})
          </button>

          {seleccion.length > 0 && (
            <button
              onClick={clearSel}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Limpiar selección
            </button>
          )}

          <div className="h-8 w-px bg-gray-600 mx-2" />

          <button
            onClick={() => setShow(s => !s)}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center gap-2"
          >
            {showListos ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Ocultar listos
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Mostrar listos
              </>
            )}
          </button>

          {/* Buscador */}
          <div className="ml-auto relative">
            <input
              placeholder="Buscar por mesa o cliente..."
              value={busq}
              onChange={e => setBusq(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla de órdenes */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 border-b border-gray-600">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && seleccion.length === data.length}
                    onChange={() => seleccion.length === data.length ? clearSel() : selectAll()}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="p-4 text-left text-gray-300 font-medium">Mesa</th>
                <th className="p-4 text-left text-gray-300 font-medium">Cliente</th>
                <th className="p-4 text-left text-gray-300 font-medium">Mozo</th>
                <th className="p-4 text-left text-gray-300 font-medium">Items</th>
                <th className="p-4 text-left text-gray-300 font-medium">Estado</th>
                <th className="p-4 text-left text-gray-300 font-medium">Tiempo</th>
                <th className="p-4 text-center text-gray-300 font-medium">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {data.map(o => {
                const tiempoTranscurrido = new Date() - new Date(o.createdAt);
                const minutos = Math.floor(tiempoTranscurrido / 60000);
                const esUrgente = minutos > 30 && o.estado === 'pendiente';

                return (
                  <tr
                    key={o.id}
                    className={`border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors duration-150 ${esUrgente ? 'bg-red-900/10' : ''}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={seleccion.includes(o.id)}
                        onChange={() => toggle(o.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-orange-400 font-bold">{o.mesa?.numero || '-'}</span>
                        </div>
                        <span className="text-white font-medium">Mesa {o.mesa?.numero || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {o.cliente ? (
                        <div>
                          <p className="text-white font-medium">{o.cliente.nombre}</p>
                          <p className="text-gray-400 text-sm">{o.cliente.telefono}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin cliente</span>
                      )}
                    </td>
                    <td className="p-4 text-white">{o.mozo?.nombre || '-'}</td>
                    <td className="p-4">
                      <span className="text-white font-medium">{o.detalles.length}</span>
                      <span className="text-gray-400 text-sm ml-1">items</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(o.estado)}`}>
                        {o.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className={`${esUrgente ? 'text-red-400' : 'text-gray-300'}`}>
                        <p className="font-medium">{minutos} min</p>
                        {esUrgente && (
                          <p className="text-xs">⚠️ Urgente</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => mostrarDetalles(o.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-all duration-200 hover:scale-110 mx-auto"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!data.length && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                    {busq ? 'No se encontraron órdenes que coincidan con la búsqueda' : 'No hay órdenes pendientes'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles */}
      <DetallesOrdenModal 
        ordenId={ordenSeleccionadaId} 
        onClose={cerrarModal} 
      />
    </div>
  );
}