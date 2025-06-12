'use client';
import { useEffect, useState } from 'react';
import {
  listarMisOrdenes,
  cancelarOrden,
  servirOrden,             // 👈 helper nuevo
} from '@/lib/api/mozo';

export default function OrdenesMozo() {
  const [ords, setOrds]   = useState([]);
  const [loading, setLd]  = useState(true);
  const [sel, setSel]     = useState([]);      // ids seleccionados
  const [err, setErr]     = useState('');

  /* cargar sólo las órdenes del mozo (middleware añadió userId al token) */
  useEffect(() => {
    (async () => {
      try { setOrds(await listarMisOrdenes()); }
      catch (e){ setErr(e.message); }
      setLd(false);
    })();
  }, []);

  /* helpers selección */
  const toggle = id =>
    setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

  /* cancelar */
  const cancelarSel = async () => {
    if (!sel.length) return;
    if (!confirm('¿Cancelar las órdenes seleccionadas?')) return;
    try {
      await Promise.all(sel.map(cancelarOrden));
      setOrds(o => o.filter(or => !sel.includes(or.id)));
      clearSel();
    } catch (e){ alert(e.message); }
  };

  /* servir */
  const servirSel = async () => {
    if (!sel.length) return;
    try {
      await Promise.all(sel.map(servirOrden));       // PUT estado = 'servido'
      setOrds(o => o.filter(or => !sel.includes(or.id)));   // desaparecen
      clearSel();
    } catch (e){ alert(e.message); }
  };

  /* mostrar sólo activas */
  const data = ords.filter(o =>
    !['cancelada', 'servido'].includes(o.estado)
  );

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mis Órdenes</h1>
      {err && <p className="text-red-500">{err}</p>}

      {/* barra de acciones */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={servirSel}
          disabled={!sel.length}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 disabled:opacity-40"
        >
          Servir
        </button>
        <button
          onClick={cancelarSel}
          disabled={!sel.length}
          className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 disabled:opacity-40"
        >
          Cancelar
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 w-10 text-center">✓</th>
            <th className="p-2">Mesa</th>
            <th className="p-2">Total</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map(o => (
            <tr key={o.id} className="even:bg-slate-800">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={sel.includes(o.id)}
                  onChange={() => toggle(o.id)}
                  className="accent-emerald-500"
                />
              </td>
              <td className="p-2">{o.mesa?.numero ?? '-'}</td>
              <td className="p-2">S/ {o.total.toFixed(2)}</td>
              <td className="p-2 capitalize">{o.estado.replace('_',' ')}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td colSpan={4} className="p-2 italic text-center text-slate-400">
                Sin órdenes activas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
