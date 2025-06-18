// src/app/mozo/mesas/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { listarMesas } from '@/lib/api/mozo';
import CreateOrderModal from '@/components/CreateOrderModal';  // ⬅️ modal con el formulario

export default function MesasMozo() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState('');
  const [mesaSel, setSel] = useState(null);      // mesa seleccionada para crear orden

  /* cargar mesas */
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

  /* cerrar modal */
  const closeModal = (ordenCreada) => {
    setSel(null);
    if (ordenCreada) location.href = '/mozo/ordenes';  // ir a la lista de órdenes
  };

  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mesas</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-4 gap-4">
        {mesas.map((m) => (
          <button
            key={m.id}
            disabled={m.estado !== 'libre'}
            onClick={() => setSel(m)}                        
            className={`h-24 rounded-lg flex items-center justify-center
              ${
                m.estado === 'libre'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-700 opacity-50 cursor-not-allowed'
              }`}
          >
            Mesa {m.numero}
          </button>
        ))}
      </div>

      {/* modal para crear la orden */}
      {mesaSel && <CreateOrderModal mesa={mesaSel} onClose={closeModal} />}
    </div>
  );
}
