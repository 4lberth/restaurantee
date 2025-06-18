// src/app/mozo/ordenes/[id]/editar/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { listarPlatos, listarMesas } from '@/lib/api/mozo';

export default function EditarOrdenMozo() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [orden, setOrden] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mesaId: '',
    cliente: {
      nombre: '',
      telefono: '',
      dni: ''
    },
    items: [],
    notas: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch order directly from API
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/ordenes/${orderId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          throw new Error('Orden no encontrada');
        }
        
        const ordenData = await response.json();
        
        // Check if order can be edited
        if (ordenData.estado === 'listo' || ordenData.estado === 'servido' || ordenData.estado === 'cancelada') {
          setError(`No se puede editar una orden en estado "${ordenData.estado}"`);
          setOrden(ordenData);
          return;
        }
        
        // Load dishes and tables
        const [platosData, mesasData] = await Promise.all([
          listarPlatos(),
          listarMesas()
        ]);

        setOrden(ordenData);
        setPlatos(platosData);
        setMesas(mesasData);

        // Initialize form with order data
        setFormData({
          mesaId: ordenData.mesaId || '',
          cliente: {
            nombre: ordenData.cliente?.nombre || '',
            telefono: ordenData.cliente?.telefono || '',
            dni: ordenData.cliente?.dni || ''
          },
          items: ordenData.detalles.map(d => ({
            platoId: d.platoId,
            cantidad: d.cantidad,
            precio: d.plato?.precio || d.subtotal / d.cantidad
          })),
          notas: ordenData.notas || ''
        });
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadData();
    }
  }, [orderId]);

  const handleClienteChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const agregarPlato = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        platoId: '',
        cantidad: 1,
        precio: 0
      }]
    }));
  };

  const eliminarPlato = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handlePlatoSelect = (index, platoId) => {
    const plato = platos.find(p => p.id === parseInt(platoId));
    if (plato) {
      handleItemChange(index, 'platoId', parseInt(platoId));
      handleItemChange(index, 'precio', plato.precio);
    }
  };

  const calcularTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mesaId) {
      alert('Por favor selecciona una mesa');
      return;
    }

    if (formData.items.length === 0) {
      alert('Agrega al menos un plato a la orden');
      return;
    }

    try {
      setSubmitting(true);
      
      const dataToUpdate = {
        mesaId: parseInt(formData.mesaId),
        cliente: formData.cliente.nombre || formData.cliente.dni ? formData.cliente : undefined,
        items: formData.items.map(item => ({
          platoId: parseInt(item.platoId),
          cantidad: parseInt(item.cantidad)
        })),
        notas: formData.notas
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ordenes/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(dataToUpdate)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar la orden');
      }

      router.push('/mozo/ordenes');
    } catch (err) {
      console.error('Error updating order:', err);
      alert(err.message || 'Error al actualizar la orden');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando orden...</div>
      </div>
    );
  }

  // Show error if order cannot be edited
  if (error || (orden && ['listo', 'servido', 'cancelada'].includes(orden.estado))) {
    const getEstadoBadge = (estado) => {
      const styles = {
        pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        preparando: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        listo: 'bg-green-500/20 text-green-400 border-green-500/30',
        servido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        cancelada: 'bg-red-500/20 text-red-400 border-red-500/30'
      };
      return styles[estado] || styles.pendiente;
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Orden #{orderId}
          </h1>
          {orden && (
            <p className="text-gray-400">
              Estado: <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(orden.estado)}`}>
                {orden.estado}
              </span>
            </p>
          )}
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-400 font-medium text-lg">No se puede editar esta orden</p>
          </div>
          <p className="text-gray-300">
            {error || `Las órdenes en estado "${orden?.estado}" no pueden ser modificadas.`}
          </p>
          {orden?.estado === 'listo' && (
            <p className="text-gray-400 text-sm mt-2">
              La orden ya fue preparada por la cocina. Solo puede ser marcada como servida.
            </p>
          )}
        </div>

        <button
          onClick={() => router.push('/mozo/ordenes')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a órdenes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Editar Orden #{orderId}
        </h1>
        <p className="text-gray-400">
          Estado actual: <span className="text-amber-400 font-medium capitalize">{orden?.estado || 'pendiente'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mesa selection */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Mesa</h2>
          <select
            value={formData.mesaId}
            onChange={(e) => setFormData(prev => ({ ...prev, mesaId: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
            required
          >
            <option value="">Seleccionar mesa</option>
            {mesas.map(mesa => (
              <option 
                key={mesa.id} 
                value={mesa.id}
                disabled={mesa.estado === 'ocupada' && mesa.id !== orden?.mesaId}
              >
                Mesa {mesa.numero} - {mesa.capacidad} personas 
                {mesa.estado === 'ocupada' && mesa.id !== orden?.mesaId ? ' (Ocupada)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente info */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Información del Cliente (Opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={formData.cliente.nombre}
              onChange={(e) => handleClienteChange('nombre', e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.cliente.telefono}
              onChange={(e) => handleClienteChange('telefono', e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <input
              type="text"
              placeholder="DNI"
              value={formData.cliente.dni}
              onChange={(e) => handleClienteChange('dni', e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Platos */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Platos</h2>
            <button
              type="button"
              onClick={agregarPlato}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Plato
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const plato = platos.find(p => p.id === item.platoId);
              return (
                <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6">
                      <label className="block text-sm text-gray-400 mb-1">Plato</label>
                      <select
                        value={item.platoId}
                        onChange={(e) => handlePlatoSelect(index, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                        required
                      >
                        <option value="">Seleccionar plato</option>
                        {platos.map(plato => (
                          <option key={plato.id} value={plato.id} disabled={!plato.disponible}>
                            {plato.nombre} - S/ {plato.precio.toFixed(2)}
                            {!plato.disponible ? ' (No disponible)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm text-gray-400 mb-1">Subtotal</label>
                      <div className="px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-amber-400 font-medium">
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => eliminarPlato(index)}
                        className="w-full px-3 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Eliminar plato"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {plato && !plato.disponible && (
                    <p className="mt-2 text-sm text-red-400">⚠️ Este plato no está disponible</p>
                  )}
                </div>
              );
            })}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No hay platos en la orden. Agrega al menos uno.
              </div>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notas de la orden</h2>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
            placeholder="Notas adicionales sobre la orden..."
            rows="3"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors resize-none"
          />
        </div>

        {/* Total and Actions */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">Total de la orden</p>
              <p className="text-3xl font-bold text-amber-400">
                S/ {calcularTotal().toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/mozo/ordenes')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Actualizar Orden
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}