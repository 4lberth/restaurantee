'use client';
import { useEffect, useState } from 'react';
import {
  listarOrdenes,
  cambiarEstadoOrden,
} from '@/lib/api/ordenes';

export default function CocinaDashboard() {
  const [ordenes, setOrd]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [seleccion, setSel] = useState([]);        // ids seleccionados
  const [busq, setBusq]     = useState('');
  const [showListos, setShow] = useState(false);   // 👈 toggle
  const [error, setErr]     = useState('');

  /* cargar órdenes */
  useEffect(() => {
    (async () => {
      try { setOrd(await listarOrdenes()); }
      catch (e){ setErr(e.message); }
      setLoad(false);
    })();
  }, []);

  /* selección */
  const toggle   = id => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

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
    } catch (e){ alert(e.message); }
  };

  /* filtrado */
  const data = ordenes
    .filter(o =>
      showListos
        ? ['pendiente','en_preparacion','listo'].includes(o.estado)
        : ['pendiente','en_preparacion'].includes(o.estado)
    )
    .filter(o =>
      (o.mesa?.numero + (o.cliente?.nombre ?? '')).toLowerCase()
        .includes(busq.toLowerCase())
    );

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Órdenes de Cocina</h1>

      {/* acciones */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setEstado('en_preparacion')}
          className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-600 disabled:opacity-40"
          disabled={!seleccion.length}
        >Preparar</button>

        <button
          onClick={() => setEstado('listo')}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 disabled:opacity-40"
          disabled={!seleccion.length}
        >Listo</button>

        <button
          onClick={() => setShow(s => !s)}
          className="px-4 py-2 rounded-lg bg-slate-600/70 hover:bg-slate-600"
        >
          {showListos ? 'Ocultar listos' : 'Mostrar listos'}
        </button>

        <input
          placeholder="Buscar…"
          value={busq}
          onChange={e => setBusq(e.target.value)}
          className="ml-auto w-60 px-3 py-2 rounded-lg bg-slate-800 placeholder-slate-400"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* tabla */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 w-10 text-center">✓</th>
            <th className="p-2">Mesa</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Items</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map(o => (
            <tr key={o.id} className="even:bg-slate-800">
              <td className="p-2 text-center">
                <input type="checkbox"
                       checked={seleccion.includes(o.id)}
                       onChange={() => toggle(o.id)}
                       className="accent-emerald-500" />
              </td>
              <td className="p-2">{o.mesa?.numero ?? '-'}</td>
              <td className="p-2">{o.cliente?.nombre ?? '-'}</td>
              <td className="p-2">{o.detalles.length}</td>
              <td className="p-2 capitalize">{o.estado.replace('_',' ')}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td colSpan={5}
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
