'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FacturaDetallePage() {
  const params = useParams();
  const facturaId = params?.id;
  
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (facturaId) {
      cargarFactura();
    }
  }, [facturaId]);

  const cargarFactura = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facturas/${facturaId}`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Factura no encontrada');
        }
        throw new Error('Error al cargar la factura');
      }
      
      const data = await response.json();
      console.log('Datos de factura:', data);
      console.log('Detalles:', data.orden?.detalles);
      setFactura(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    const numero = Number(valor) || 0;
    return `S/ ${numero.toFixed(2)}`;
  };

  const imprimirFactura = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando factura...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
        <Link
          href="/mozo/facturas"
          className="inline-flex items-center text-orange-400 hover:text-orange-300"
        >
          ← Volver a facturas
        </Link>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Factura no encontrada</p>
        <Link
          href="/mozo/facturas"
          className="inline-flex items-center mt-4 text-orange-400 hover:text-orange-300"
        >
          ← Volver a facturas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Solo visible en pantalla */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Factura #{factura.id}
            </h1>
            <p className="text-gray-400">
              Detalle completo de la factura y orden
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/mozo/facturas"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Versión para impresión - OPTIMIZADA PARA IMPRESORAS DE TICKETS */}
      <div className="print-only">
        <div className="print-content">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>RESTAURANTE LIMA</div>
            <div style={{ fontSize: '9px', margin: '1px 0' }}>RUC: 20123456789</div>
            <div style={{ fontSize: '9px', margin: '1px 0' }}>Av. Principal 123, Lima</div>
            <div style={{ fontSize: '9px', margin: '1px 0' }}>Tel: 01-234-5678</div>
          </div>
          
          <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>FACTURA #{factura.id}</div>
          </div>

          <div style={{ marginBottom: '8px', fontSize: '9px' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>ORDEN #{factura.orden.id}</strong>
            </div>
            <div>Mesa: {factura.orden.mesa?.numero || 'N/A'}</div>
            <div>Fecha: {formatearFecha(factura.creadoEn)}</div>
            {factura.cliente && (
              <div>Cliente: {factura.cliente.nombre}</div>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', marginBottom: '4px' }}>
            <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span style={{ width: '55%' }}>DESCRIPCION</span>
              <span style={{ width: '15%', textAlign: 'center' }}>CANT</span>
              <span style={{ width: '30%', textAlign: 'right' }}>IMPORTE</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '4px', marginBottom: '4px' }}>
            {factura.orden.detalles.map((detalle, index) => (
              <div key={detalle.id} style={{ marginBottom: '2px' }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
                  {detalle.plato.nombre}
                </div>
                <div style={{ fontSize: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatearMoneda(detalle.precio || detalle.plato.precio)} x {detalle.cantidad}</span>
                  <span>{formatearMoneda(detalle.cantidad * (detalle.precio || detalle.plato.precio))}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '9px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
              <span>SUBTOTAL:</span>
              <span>{formatearMoneda(factura.subtotal)}</span>
            </div>
            {factura.descuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>DESCUENTO ({factura.tipoDescuento === 'porcentaje' ? factura.descuento + '%' : ''}):</span>
                <span>-{formatearMoneda(factura.tipoDescuento === 'porcentaje' ? factura.subtotal * (factura.descuento / 100) : factura.descuento)}</span>
              </div>
            )}
            {factura.propina > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>PROPINA:</span>
                <span>+{formatearMoneda(factura.propina)}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid #000', paddingTop: '2px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                <span>TOTAL:</span>
                <span>{formatearMoneda(factura.totalFinal)}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '8px' }}>
            <div>¡Gracias por su preferencia!</div>
            <div>www.restaurantelima.com</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Información de la factura */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos generales */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Factura ID</p>
                <p className="text-white font-medium">#{factura.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Orden ID</p>
                <p className="text-white font-medium">#{factura.orden.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mesa</p>
                <p className="text-white font-medium">
                  Mesa {factura.orden.mesa?.numero || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cliente</p>
                <p className="text-white font-medium">
                  {factura.cliente?.nombre || 'Sin cliente'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fecha de emisión</p>
                <p className="text-white font-medium">
                  {formatearFecha(factura.creadoEn)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estado de orden</p>
                <span className="inline-block bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                  {factura.orden.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles de la orden */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Platos Ordenados</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Plato</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium">Categoría</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-medium">Cantidad</th>
                    <th className="px-4 py-3 text-right text-gray-300 font-medium">Precio Unit.</th>
                    <th className="px-4 py-3 text-right text-gray-300 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {factura.orden.detalles.map((detalle) => (
                    <tr key={detalle.id} className="hover:bg-gray-700/20">
                      <td className="px-4 py-3 text-white">
                        {detalle.plato.nombre}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {detalle.plato.categoria?.nombre || 'Sin categoría'}
                      </td>
                      <td className="px-4 py-3 text-center text-white font-medium">
                        {detalle.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        {formatearMoneda(detalle.precio || detalle.plato.precio)}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {formatearMoneda(detalle.cantidad * (detalle.precio || detalle.plato.precio))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resumen de facturación */}
        <div className="space-y-6">
          {/* Totales */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen de Facturación</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>{formatearMoneda(factura.subtotal)}</span>
              </div>
              
              {factura.descuento > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>Descuento:</span>
                  <span>
                    -{factura.tipoDescuento === 'porcentaje' 
                      ? `${factura.descuento}%` 
                      : formatearMoneda(factura.descuento)
                    }
                  </span>
                </div>
              )}
              
              {factura.propina > 0 && (
                <div className="flex justify-between text-blue-400">
                  <span>Propina:</span>
                  <span>+{formatearMoneda(factura.propina)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-white font-semibold text-xl">
                  <span>Total Final:</span>
                  <span className="text-green-400">{formatearMoneda(factura.totalFinal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          {factura.cliente && (
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Datos del Cliente</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-400 text-sm">Nombre</p>
                  <p className="text-white">{factura.cliente.nombre}</p>
                </div>
                {factura.cliente.email && (
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{factura.cliente.email}</p>
                  </div>
                )}
                {factura.cliente.telefono && (
                  <div>
                    <p className="text-gray-400 text-sm">Teléfono</p>
                    <p className="text-white">{factura.cliente.telefono}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            <div className="space-y-3">
              <button
                onClick={imprimirFactura}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                🖨️ Imprimir Factura
              </button>
              <Link
                href={`/mozo/ordenes/${factura.orden.id}`}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-center transition-colors"
              >
                📋 Ver Orden Completa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        /* Estilos para pantalla */
        .print-only {
          display: none;
        }
        
        /* Estilos para impresión */
        @media print {
          /* Ocultar TODO excepto el contenido de la factura */
          body * {
            visibility: hidden;
          }
          
          .print-only,
          .print-only * {
            visibility: visible;
          }
          
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          
          .print-content {
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          
          /* Configuración de página */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Evitar saltos de página en elementos importantes */
          .print-content {
            page-break-inside: avoid;
          }
          
          /* Asegurar que no hay elementos flotantes o posicionados */
          * {
            float: none !important;
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}