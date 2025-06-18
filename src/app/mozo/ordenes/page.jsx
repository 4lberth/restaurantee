// src/app/mozo/ordenes/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  listarMisOrdenes,
  cancelarOrden,
  servirOrden,
} from '@/lib/api/mozo';

export default function OrdenesMozo() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try { setOrdenes(await listarMisOrdenes()); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const servir = async id => {
    try { 
      await servirOrden(id);  
      setOrdenes(o => o.filter(x => x.id !== id)); 
    }
    catch (e) { alert(e.message); }
  };

  const eliminar = async id => {
    if (!confirm('¿Cancelar esta orden?')) return;
    try { 
      await cancelarOrden(id); 
      setOrdenes(o => o.filter(x => x.id !== id)); 
    }
    catch (e) { alert(e.message); }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      preparando: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      listo: 'bg-green-500/20 text-green-400 border-green-500/30',
      servido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelada: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[estado] || styles.pendiente;
  };

  const data = ordenes.filter(o => !['servido', 'cancelada'].includes(o.estado));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Cargando…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Mis Órdenes</h1>
        <p className="text-gray-400">Gestiona las órdenes activas y su estado</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Estadísticas de órdenes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Activas</p>
              <p className="text-2xl font-bold text-white">{data.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-white">{data.filter(o => o.estado === 'pendiente').length}</p>
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
              <p className="text-orange-400 text-sm">Preparando</p>
              <p className="text-2xl font-bold text-white">{data.filter(o => o.estado === 'preparando').length}</p>
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
              <p className="text-green-400 text-sm">Listas</p>
              <p className="text-2xl font-bold text-white">{data.filter(o => o.estado === 'listo').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50 border-b border-gray-600">
                <th className="p-4 text-left text-gray-300 font-medium">Mesa</th>
                <th className="p-4 text-left text-gray-300 font-medium">Cliente</th>
                <th className="p-4 text-left text-gray-300 font-medium">Mozo</th>
                <th className="p-4 text-left text-gray-300 font-medium">Ítems</th>
                <th className="p-4 text-left text-gray-300 font-medium">Total</th>
                <th className="p-4 text-left text-gray-300 font-medium">Estado</th>
                <th className="p-4 text-left text-gray-300 font-medium">Fecha / Hora</th>
                <th className="p-4 text-center text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data.map(o => (
                <tr key={o.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors duration-150">
                  <td className="p-4">
                    <span className="font-medium text-white">Mesa {o.mesa?.numero ?? '-'}</span>
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

                  <td className="p-4 text-white">{o.mozo?.nombre ?? '—'}</td>
                  <td className="p-4 text-white">{o.detalles.length} platos</td>
                  <td className="p-4 text-orange-400 font-semibold">S/ {o.total.toFixed(2)}</td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(o.estado)}`}>
                      {o.estado.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-4 text-gray-300 text-sm">
                    {new Date(o.createdAt).toLocaleString('es-PE', { 
                      dateStyle: 'short', 
                      timeStyle: 'short' 
                    })}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => router.push(`/mozo/ordenes/${o.id}/editar`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/80 hover:bg-amber-600 text-white transition-all duration-200 hover:scale-110"
                        title="Editar orden"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => servir(o.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200 hover:scale-110"
                        title="Marcar como servido"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => eliminar(o.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600/80 hover:bg-red-700 text-white transition-all duration-200 hover:scale-110"
                        title="Cancelar orden"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!data.length && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                    No hay órdenes activas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}