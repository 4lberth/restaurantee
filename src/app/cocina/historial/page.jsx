'use client';
import { useEffect, useState } from 'react';
import { listarHistorial } from '@/lib/api/cocina';
import { useRouter } from 'next/navigation';

export default function HistorialCocina() {
  const [ordenes, setOrdenes] = useState([]);
  const [fecha,  setFecha]    = useState(() => new Date().toISOString().slice(0,10)); // hoy
  const [loading,setLoading]  = useState(true);
  const [error,  setError]    = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try   { setOrdenes(await listarHistorial({ desde: fecha, hasta: fecha })); }
      catch (e){ setError(e.message); }
      finally  { setLoading(false); }
    })();
  }, [fecha]);

  if (loading) return <p className="p-8 text-gray-400">Cargando…</p>;

  return (
    <div className="space-y-6">
      {/* ───────── Header + filtro fecha ───────── */}
      <div className="flex items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Historial de Órdenes</h1>
          <p className="text-gray-400">Órdenes servidas o canceladas</p>
        </div>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
               className="bg-slate-800 border border-slate-600 rounded px-3 py-1"/>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* ───────── Tabla ───────── */}
      <div className="overflow-x-auto bg-slate-800/40 border border-slate-700 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-700/60">
            <tr>
              <th className="p-3">Mesa</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Mozo</th>
              <th className="p-3">Ítems</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Hora</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(o=>(
              <tr key={o.id} className="even:bg-slate-900/40">
                <td className="p-3 font-medium">#{o.mesa?.numero??'-'}</td>
                <td className="p-3">{o.cliente?.nombre??'—'}</td>
                <td className="p-3">{o.mozo?.nombre??'—'}</td>
                <td className="p-3">{o.detalles.length}</td>
                <td className="p-3 text-amber-400">S/ {o.total.toFixed(2)}</td>
                <td className="p-3 capitalize">{o.estado}</td>
                <td className="p-3 text-sm text-slate-400">
                  {new Date(o.createdAt).toLocaleTimeString('es-PE',{ hour:'2-digit',minute:'2-digit' })}
                </td>
              </tr>
            ))}
            {!ordenes.length && (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400 italics">
                Sin órdenes para la fecha seleccionada
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={()=>router.push('/cocina')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
        ← Volver al panel
      </button>
    </div>
  );
}
