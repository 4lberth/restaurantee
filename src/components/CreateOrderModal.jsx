// src/app/mozo/CreateOrderModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { crearOrden, listarClientes } from '@/lib/api/mozo';

export default function CreateOrderModal({ mesa, onClose }) {
  const [cats, setCats] = useState([]);
  const [cart, setCart] = useState([]);
  const [notas, setNotas] = useState('');
  const [loading, setLoad] = useState(false);
  const [msg, setMsg] = useState('');

  const [clientes, setClientes] = useState([]);
  const [clienteSel, setCliSel] = useState('');
  const [nuevo, setNuevo] = useState({ nombre: '', dni: '', telefono: '' });

  useEffect(() => {
    (async () => {
      try {
        const [platos, cls] = await Promise.all([
          fetch('/api/platos?soloDisponibles=1', { credentials: 'include' })
            .then(r => r.json()),
          listarClientes()
        ]);
        setCats(platos);
        setClientes(cls);
      } catch { setMsg('Error al cargar datos'); }
    })();
  }, []);

  const add = p =>
    setCart(c => {
      const i = c.findIndex(x => x.platoId === p.id);
      if (i > -1) { const copy = [...c]; copy[i].cantidad++; return copy; }
      return [...c, { platoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }];
    });

  const remove = id =>
    setCart(c => c.map(it => it.platoId === id ? { ...it, cantidad: it.cantidad - 1 } : it)
      .filter(it => it.cantidad > 0));

  const enviar = async () => {
    if (!cart.length) return setMsg('Añade al menos un plato');
    if (clienteSel === 'nuevo' && !(nuevo.nombre && nuevo.dni && nuevo.telefono))
      return setMsg('Completa los datos del nuevo cliente');

    setLoad(true); setMsg('');
    try {
      await crearOrden({
        mesaId: mesa.id,
        clienteId: clienteSel && clienteSel !== 'nuevo' ? Number(clienteSel) : undefined,
        cliente: clienteSel === 'nuevo' ? nuevo : undefined,
        items: cart.map(({ platoId, cantidad }) => ({ platoId, cantidad })),
        notas
      });
      onClose(true);
    } catch (e) { setMsg(e.message); setLoad(false); }
  };

  const total = cart.reduce((s, it) => s + it.precio * it.cantidad, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur border border-gray-700 rounded-2xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Crear Orden</h2>
              <p className="text-orange-400 font-medium">Mesa {mesa.numero}</p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selección de cliente */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
            <label className="block text-white font-medium mb-3">Cliente</label>
            <select
              value={clienteSel}
              onChange={e => setCliSel(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 px-4 py-2 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
            >
              <option value="">(Sin cliente)</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.dni}</option>
              ))}
              <option value="nuevo">➕ Nuevo cliente…</option>
            </select>

            {clienteSel === 'nuevo' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <input 
                  placeholder="Nombre completo" 
                  value={nuevo.nombre}
                  onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))}
                  className="md:col-span-3 bg-gray-700/50 border border-gray-600 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                />
                <input 
                  placeholder="DNI" 
                  value={nuevo.dni}
                  onChange={e => setNuevo(n => ({ ...n, dni: e.target.value }))}
                  className="bg-gray-700/50 border border-gray-600 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                />
                <input 
                  placeholder="Teléfono" 
                  value={nuevo.telefono}
                  onChange={e => setNuevo(n => ({ ...n, telefono: e.target.value }))}
                  className="md:col-span-2 bg-gray-700/50 border border-gray-600 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                />
              </div>
            )}
          </div>

          {/* Catálogo de platos */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-4">Seleccionar Platos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {cats.flatMap(c => c.platos).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => add(p)}
                  className="p-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-orange-500/50 text-left transition-all duration-200 group"
                >
                  <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors duration-200">{p.nombre}</h3>
                  <p className="text-sm text-gray-400 mb-2">{p.descripcion}</p>
                  <p className="text-orange-400 font-semibold">S/ {p.precio.toFixed(2)}</p>
                </button>
              ))}
            </div>

            {!cats.flatMap(c => c.platos).length && (
              <div className="text-center py-8">
                <p className="text-gray-400 italic">No hay platos disponibles</p>
              </div>
            )}
          </div>

          {/* Carrito */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-4">Platos Seleccionados</h3>
            
            {cart.length ? (
              <div className="space-y-3">
                {cart.map(it => (
                  <div key={it.platoId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{it.nombre}</p>
                      <p className="text-orange-400 text-sm">S/ {it.precio.toFixed(2)} c/u</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => remove(it.platoId)} 
                        className="w-8 h-8 flex items-center justify-center bg-red-600/80 hover:bg-red-700 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="w-8 text-center text-white font-medium">{it.cantidad}</span>
                      
                      <button 
                        onClick={() => add({ id: it.platoId, ...it })} 
                        className="w-8 h-8 flex items-center justify-center bg-green-600/80 hover:bg-green-700 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      
                      <div className="w-20 text-right">
                        <span className="text-orange-400 font-semibold">S/ {(it.precio * it.cantidad).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Total:</span>
                    <span className="text-2xl font-bold text-orange-400">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                </div>
                <p className="text-gray-400 italic">No hay platos en el carrito</p>
                <p className="text-gray-500 text-sm mt-1">Selecciona platos del catálogo</p>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 mb-6">
            <label className="block text-white font-medium mb-3">Notas para Cocina</label>
            <textarea
              placeholder="Instrucciones especiales, alergias, preferencias..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              className="w-full bg-gray-700/50 border border-gray-600 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200 resize-none"
            />
          </div>

          {/* Mensaje de error */}
          {msg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{msg}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button 
              onClick={() => onClose(false)}
              className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button 
              disabled={loading || !cart.length} 
              onClick={enviar}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creando…</span>
                </div>
              ) : (
                'Crear Orden'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}