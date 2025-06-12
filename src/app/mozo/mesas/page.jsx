'use client';
import { useEffect, useState } from 'react';
import { listarMesas, crearOrden } from '@/lib/api/mozo';

export default function MesasMozo() {
  const [mesas, setMesas]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [cliente, setCli]   = useState('');          // opcional
  const [error, setErr]     = useState('');

  useEffect(() => {
    (async () => {
      try { setMesas(await listarMesas()); }
      catch (e){ setErr(e.message); }
      setLoad(false);
    })();
  }, []);

  const iniciarOrden = async (m) => {
    try {
      await crearOrden({
        mesaId: m.id,
        clienteId: cliente || null,
        items: [],               // se podrán agregar luego
        notas: ''
      });
      location.href = '/mozo/ordenes';   // ir a la lista
    } catch (e){ alert(e.message); }
  };

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mesas</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-4 gap-4">
        {mesas.map(m => (
          <button
            key={m.id}
            disabled={m.estado !== 'libre'}
            onClick={() => iniciarOrden(m)}
            className={`h-24 rounded-lg flex items-center justify-center
              ${m.estado === 'libre'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
          >
            Mesa {m.numero}
          </button>
        ))}
      </div>
    </div>
  );
}
