// src/app/admin/mesas/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
  listarMesas,
  crearMesa,
  cambiarEstadoMesa,
} from '@/lib/api/mesas';

export default function MesasAdmin() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numero, setNumero] = useState('');
  const [seleccion, setSel] = useState([]);
  const [busqueda, setBusq] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setMesas(await listarMesas()); }
      catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await crearMesa(Number(numero));
      location.reload();
    } catch (e) { setError(e.message); }
  };

  const cambiarEstado = async (estado) => {
    if (seleccion.length !== 1)
      return alert('Selecciona exactamente una mesa');
    try {
      await cambiarEstadoMesa(seleccion[0], estado);
      location.reload();
    } catch (e) { alert(e.message); }
  };

  const filtro = busqueda.toLowerCase();
  const mesasFiltradas = mesas.filter(m =>
    (m.numero + m.estado).toString().toLowerCase().includes(filtro)
  );

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
        <p className="text-gray-400">Administra el estado y disponibilidad de las mesas</p>
      </div>

      {/* Barra de acciones */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => cambiarEstado('libre')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            disabled={seleccion.length !== 1}
          >
            Marcar libre
          </button>

          <button
            onClick={() => cambiarEstado('ocupada')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
            disabled={seleccion.length !== 1}
          >
            Marcar ocupada
          </button>

          <input
            type="text"
            placeholder="Buscar mesa…"
            value={busqueda}
            onChange={e => setBusq(e.target.value)}
            className="ml-auto w-60 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Formulario nueva mesa */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Nueva Mesa</h2>
        <form onSubmit={onSubmit} className="flex gap-4">
          <input
            type="number"
            min="1"
            placeholder="Número de mesa"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25">
            Crear mesa
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50 border-b border-gray-600">
              <th className="p-4 w-12 text-center text-gray-300">
                <input
                  type="checkbox"
                  onChange={e => setSel(e.target.checked ? mesas.map(m => m.id) : [])}
                  className="accent-orange-500"
                />
              </th>
              <th className="p-4 text-left text-gray-300 font-medium">Número</th>
              <th className="p-4 text-left text-gray-300 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {mesasFiltradas.map(m => (
              <tr key={m.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-150">
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={seleccion.includes(m.id)}
                    onChange={() => toggle(m.id)}
                    className="accent-orange-500"
                  />
                </td>
                <td className="p-4 text-white font-medium">Mesa {m.numero}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    m.estado === 'libre' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {m.estado === 'libre' ? 'Libre' : 'Ocupada'}
                  </span>
                </td>
              </tr>
            ))}
            {!mesasFiltradas.length && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                  {busqueda ? 'No se encontraron mesas que coincidan con la búsqueda' : 'No hay mesas registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}