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
  const [seleccion, setSeleccion] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const cargarMesas = async () => {
    try {
      const mesasData = await listarMesas();
      setMesas(mesasData);
      setError('');
    } catch (e) {
      setError(`Error al cargar mesas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const toggle = id => setSeleccion(s => 
    s.includes(id) ? s.filter(x => x !== id) : [...s, id]
  );

  const clearSeleccion = () => setSeleccion([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!numero || numero <= 0) {
      setError('Por favor ingresa un número de mesa válido');
      return;
    }

    setProcessing(true);
    clearMessages();

    try {
      const nuevaMesa = await crearMesa(Number(numero));
      setSuccess(`Mesa ${nuevaMesa.numero} creada exitosamente`);
      setNumero('');
      await cargarMesas(); // Recargar la lista
    } catch (e) {
      setError(`Error al crear mesa: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const cambiarEstado = async (estado) => {
    if (seleccion.length !== 1) {
      setError('Selecciona exactamente una mesa para cambiar su estado');
      return;
    }

    setProcessing(true);
    clearMessages();

    try {
      const mesaId = seleccion[0];
      const mesa = mesas.find(m => m.id === mesaId);
      
      await cambiarEstadoMesa(mesaId, estado);
      setSuccess(`Mesa ${mesa.numero} marcada como ${estado}`);
      setSeleccion([]);
      await cargarMesas(); // Recargar la lista
    } catch (e) {
      setError(`Error al cambiar estado: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filtro = busqueda.toLowerCase();
  const mesasFiltradas = mesas.filter(m =>
    (m.numero.toString() + m.estado).toLowerCase().includes(filtro)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <div className="ml-3 text-gray-400">Cargando mesas...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Gestión de Mesas</h1>
        <p className="text-gray-400">Administra el estado y disponibilidad de las mesas</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={clearMessages}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-green-400">{success}</p>
            <button 
              onClick={clearMessages}
              className="text-green-400 hover:text-green-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => cambiarEstado('libre')}
            disabled={seleccion.length !== 1 || processing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            {processing ? 'Procesando...' : 'Marcar libre'}
          </button>

          <button
            onClick={() => cambiarEstado('ocupada')}
            disabled={seleccion.length !== 1 || processing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            {processing ? 'Procesando...' : 'Marcar ocupada'}
          </button>

          {seleccion.length > 0 && (
            <button
              onClick={clearSeleccion}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-medium transition-all duration-200"
            >
              Limpiar selección ({seleccion.length})
            </button>
          )}

          <input
            type="text"
            placeholder="Buscar mesa..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
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
            max="999"
            placeholder="Número de mesa"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            disabled={processing}
            className="w-48 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200 disabled:opacity-50"
            required
          />
          <button 
            type="submit"
            disabled={processing || !numero}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            {processing ? 'Creando...' : 'Crear mesa'}
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50 border-b border-gray-600">
              <th className="p-4 w-12 text-center text-gray-300">
                <input
                  type="checkbox"
                  checked={seleccion.length === mesas.length && mesas.length > 0}
                  onChange={e => setSeleccion(e.target.checked ? mesas.map(m => m.id) : [])}
                  className="accent-orange-500"
                  disabled={processing}
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
                    disabled={processing}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{mesas.length}</div>
          <div className="text-gray-400">Total mesas</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {mesas.filter(m => m.estado === 'libre').length}
          </div>
          <div className="text-gray-400">Mesas libres</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-400">
            {mesas.filter(m => m.estado === 'ocupada').length}
          </div>
          <div className="text-gray-400">Mesas ocupadas</div>
        </div>
      </div>
    </div>
  );
}