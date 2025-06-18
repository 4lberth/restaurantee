'use client';
import { useEffect, useState } from 'react';
import { crearOrden } from '@/lib/api/mozo';       // helper ya existente

export default function CreateOrderModal({ mesa, onClose }) {
  /* catálogo de platos */
  const [cats, setCats] = useState([]);
  const [cart, setCart] = useState([]);      // [{ platoId, cantidad }]
  const [notas, setNotas] = useState('');
  const [loading, setLoad] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/platos')
      .then(r => r.json())
      .then(setCats);
  }, []);

  const add = (p) =>
    setCart(c => {
      const i = c.findIndex(x => x.platoId === p.id);
      if (i > -1) { const copy=[...c]; copy[i].cantidad++; return copy; }
      return [...c, { platoId:p.id, cantidad:1 }];
    });

  const remove = (platoId) =>
    setCart(c => c.map(it => it.platoId===platoId
                     ? { ...it, cantidad: it.cantidad-1 }
                     : it).filter(it => it.cantidad>0));

  const enviar = async () => {
    if (!cart.length) return setMsg('Añade al menos un plato');
    setLoad(true);
    try {
      await crearOrden({
        mesaId: mesa.id,
        clienteId: null,          // o agrega un select si lo necesitas
        items: cart,
        notas,
      });
      onClose(true);             // true = éxito
    } catch (e) {
      setMsg(e.message);
      setLoad(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[640px] max-h-[90vh] overflow-y-auto bg-slate-900 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Crear orden • Mesa {mesa.numero}</h2>

        {/* catálogo */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {cats.flatMap(c=>c.platos).map(p=>(
            <button key={p.id} onClick={()=>add(p)}
                    className="p-3 rounded bg-slate-700 hover:bg-slate-600 text-left">
              <h3>{p.nombre}</h3>
              <p className="text-sm text-slate-400">S/ {p.precio.toFixed(2)}</p>
            </button>
          ))}
        </div>

        {/* carrito */}
        <h3 className="font-medium mb-2">Platos seleccionados</h3>
        {cart.length
          ? cart.map(it => (
              <div key={it.platoId} className="flex items-center gap-2 mb-1">
                <span>Plato {it.platoId}</span>
                <button onClick={()=>remove(it.platoId)}
                        className="px-2 rounded bg-slate-700">−</button>
                <span>{it.cantidad}</span>
                <button onClick={()=>add({id:it.platoId})}
                        className="px-2 rounded bg-slate-700">+</button>
              </div>
            ))
          : <p className="italic text-slate-400 mb-2">Sin platos aún</p>}

        {/* notas */}
        <textarea
          placeholder="Notas para cocina…"
          value={notas}
          onChange={e=>setNotas(e.target.value)}
          className="w-full h-24 mt-4 p-2 rounded bg-slate-800"
        />

        {msg && <p className="text-red-500 mt-2">{msg}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={()=>onClose(false)}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">
            Cancelar
          </button>
          <button
            disabled={loading}
            onClick={enviar}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40">
            {loading ? 'Creando…' : 'Crear orden'}
          </button>
        </div>
      </div>
    </div>
  );
}
