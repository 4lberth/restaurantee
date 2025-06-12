'use client';
import { useEffect, useState } from 'react';
import {
  listarMesas,
  crearMesa,
  cambiarEstadoMesa,
} from '@/lib/api/mesas';

export default function MesasAdmin() {
  const [mesas, setMesas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [numero, setNumero]   = useState('');
  const [seleccion, setSel]   = useState([]);     // ids marcados
  const [busqueda, setBusq]   = useState('');
  const [error, setError]     = useState('');

  /* cargar datos */
  useEffect(() => {
    (async () => {
      try { setMesas(await listarMesas()); }
      catch (e){ setError(e.message); }
      setLoading(false);
    })();
  }, []);

  /* helpers selección */
  const toggle   = id => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

  /* crear mesa */
  const onSubmit = async e => {
    e.preventDefault();
    try {
      await crearMesa(Number(numero));
      location.reload();
    } catch (e){ setError(e.message); }
  };

  /* cambiar estado */
  const cambiarEstado = async (estado) => {
    if (seleccion.length !== 1)
      return alert('Selecciona exactamente una mesa');
    try {
      await cambiarEstadoMesa(seleccion[0], estado);
      location.reload();
    } catch (e){ alert(e.message); }
  };

  /* filtrado búsqueda */
  const filtro = busqueda.toLowerCase();
  const mesasFiltradas = mesas.filter(m =>
    (m.numero + m.estado).toString().toLowerCase().includes(filtro)
  );

  /* UI */
  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Mesas</h1>

      {/* Barra acciones */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => cambiarEstado('libre')}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 disabled:opacity-40"
          disabled={seleccion.length !== 1}
        >
          Marcar libre
        </button>

        <button
          onClick={() => cambiarEstado('ocupada')}
          className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-600 disabled:opacity-40"
          disabled={seleccion.length !== 1}
        >
          Marcar ocupada
        </button>

        <input
          type="text"
          placeholder="Buscar mesa…"
          value={busqueda}
          onChange={e => setBusq(e.target.value)}
          className="ml-auto w-60 px-3 py-2 rounded-lg bg-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Formulario nueva mesa */}
      <form
        onSubmit={onSubmit}
        className="flex gap-4 bg-slate-800/60 p-4 rounded-lg w-fit"
      >
        <input
          type="number"
          min="1"
          placeholder="N° mesa"
          value={numero}
          onChange={e => setNumero(e.target.value)}
          className="px-3 py-2 w-32 rounded-lg bg-slate-900"
          required
        />
        <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
          Crear mesa
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* Tabla */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 w-10 text-center">✓</th>
            <th className="p-2">Número</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {mesasFiltradas.map(m => (
            <tr key={m.id} className="even:bg-slate-800">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={seleccion.includes(m.id)}
                  onChange={() => toggle(m.id)}
                  className="accent-emerald-500"
                />
              </td>
              <td className="p-2">{m.numero}</td>
              <td className="p-2 capitalize">
                {m.estado === 'libre' ? 'Libre' : 'Ocupada'}
              </td>
            </tr>
          ))}
          {!mesasFiltradas.length && (
            <tr>
              <td colSpan={3}
                  className="p-2 italic text-center text-slate-400">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
