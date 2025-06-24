'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CrearFacturaPage() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState('porcentaje');
  const [propina, setPropina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarOrdenesSinFactura();
  }, []);

  const cargarOrdenesSinFactura = async () => {
    try {
      // Obtener todas las órdenes
      const responseOrdenes = await fetch('/api/ordenes', { credentials: 'include' });
      const todasOrdenes = await responseOrdenes.json();

      // Obtener todas las facturas para filtrar
      const responseFacturas = await fetch('/api/facturas', { credentials: 'include' });
      const facturas = await responseFacturas.json();
      
      const ordenesConFactura = facturas.map(f => f.ordenId);
      
      // Filtrar órdenes sin factura y que estén servidas/listas
      const ordenesSinFactura = todasOrdenes.filter(orden => 
        !ordenesConFactura.includes(orden.id) &&
        ['servido', 'listo'].includes(orden.estado)
      );

      setOrdenes(ordenesSinFactura);
    } catch (err) {
      setError('Error al cargar órdenes: ' + err.message);
    }
  };

  const calcularTotal = () => {
    if (!ordenSeleccionada) return 0;
    
    const subtotal = ordenSeleccionada.total;
    const valorDescuento = tipoDescuento === 'porcentaje' 
      ? subtotal * (descuento / 100)
      : descuento;
    
    return Math.max(0, subtotal - valorDescuento + propina);
  };

  const crearFactura = async () => {
    if (!ordenSeleccionada) {
      setError('Debe seleccionar una orden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ordenId: ordenSeleccionada.id,
          descuento,
          tipoDescuento,
          propina
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear factura');
      }

      const factura = await response.json();
      router.push(`/mozo/facturas/${factura.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return `S/ ${Number(valor).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nueva Factura</h1>
            <p className="text-gray-400">
              Selecciona una orden y configura los detalles de facturación
            </p>
          </div>
          <Link
            href="/mozo/facturas"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Volver a facturas
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de orden */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Seleccionar Orden</h3>
          
          {ordenes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400">No hay órdenes pendientes de facturación</p>
              <p className="text-gray-500 text-sm mt-1">
                Las órdenes servidas aparecerán aquí para poder facturarlas
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ordenes.map((orden) => (
                <div
                  key={orden.id}
                  onClick={() => setOrdenSeleccionada(orden)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    ordenSeleccionada?.id === orden.id
                      ? 'bg-orange-500/20 border-orange-500/50'
                      : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">Orden #{orden.id}</h4>
                    <span className="text-green-400 font-semibold">
                      {formatearMoneda(orden.total)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p>Mesa: {orden.mesa?.numero || 'N/A'}</p>
                    <p>Cliente: {orden.cliente?.nombre || 'Sin cliente'}</p>
                    <p>Estado: <span className="text-blue-400">{orden.estado}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuración de factura */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detalles de Facturación</h3>
          
          {ordenSeleccionada ? (
            <div className="space-y-6">
              {/* Descuento */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Descuento
                </label>
                <div className="flex space-x-3">
                  <select
                    value={tipoDescuento}
                    onChange={(e) => setTipoDescuento(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="porcentaje">%</option>
                    <option value="monto">S/</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={tipoDescuento === 'porcentaje' ? 100 : ordenSeleccionada.total}
                    value={descuento}
                    onChange={(e) => setDescuento(Number(e.target.value))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Propina */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Propina
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={propina}
                  onChange={(e) => setPropina(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
              </div>

              {/* Resumen */}
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatearMoneda(ordenSeleccionada.total)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Descuento:</span>
                    <span>
                      -{tipoDescuento === 'porcentaje' 
                        ? `${descuento}% (${formatearMoneda(ordenSeleccionada.total * (descuento / 100))})`
                        : formatearMoneda(descuento)
                      }
                    </span>
                  </div>
                )}
                {propina > 0 && (
                  <div className="flex justify-between text-blue-400">
                    <span>Propina:</span>
                    <span>+{formatearMoneda(propina)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-400">{formatearMoneda(calcularTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Botón crear */}
              <button
                onClick={crearFactura}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                {loading ? 'Creando factura...' : 'Crear Factura'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Selecciona una orden para continuar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}