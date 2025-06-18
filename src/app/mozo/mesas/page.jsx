// src/app/mozo/mesas/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { listarMesas } from '@/lib/api/mozo';
import CreateOrderModal from '@/components/CreateOrderModal';

export default function MesasMozo() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState('');
  const [mesaSel, setSel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setMesas(await listarMesas());
      } catch (e) {
        setErr(e.message);
      }
      setLoad(false);
    })();
  }, []);

  const closeModal = (ordenCreada) => {
    setSel(null);
    if (ordenCreada) location.href = '/mozo/ordenes';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Cargando…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Gestión de Mesas</h1>
        <p className="text-gray-400">Selecciona una mesa libre para crear una nueva orden</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Mesas</p>
              <p className="text-2xl font-bold text-white">{mesas.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Mesas Libres</p>
              <p className="text-2xl font-bold text-white">{mesas.filter(m => m.estado === 'libre').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-white">{mesas.filter(m => m.estado === 'ocupada').length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Seleccionar Mesa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mesas.map((m) => (
            <button
              key={m.id}
              disabled={m.estado !== 'libre'}
              onClick={() => setSel(m)}
              className={`h-20 rounded-xl flex flex-col items-center justify-center font-medium transition-all duration-200 ${
                m.estado === 'libre'
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer'
                  : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 opacity-75 cursor-not-allowed'
              }`}
            >
              <span className="text-lg font-bold">Mesa {m.numero}</span>
              <span className="text-xs opacity-75">
                {m.estado === 'libre' ? 'Disponible' : 'Ocupada'}
              </span>
            </button>
          ))}
        </div>

        {!mesas.length && (
          <div className="text-center py-8">
            <p className="text-gray-400 italic">No hay mesas registradas</p>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded"></div>
            <span className="text-gray-300 text-sm">Mesa disponible - Clic para crear orden</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded"></div>
            <span className="text-gray-300 text-sm">Mesa ocupada - No disponible</span>
          </div>
        </div>
      </div>

      {/* Modal para crear la orden */}
      {mesaSel && <CreateOrderModal mesa={mesaSel} onClose={closeModal} />}
    </div>
  );
}