'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FacturasPage() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'hoy', 'semana'

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facturas', { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar facturas');
      
      const data = await response.json();
      setFacturas(data);
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
    return `S/ ${Number(valor).toFixed(2)}`;
  };

  const filtrarFacturas = () => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    return facturas.filter(factura => {
      const fechaFactura = new Date(factura.creadoEn);
      
      switch (filtro) {
        case 'hoy':
          return fechaFactura >= hoy;
        case 'semana':
          return fechaFactura >= semanaAtras;
        default:
          return true;
      }
    });
  };

  const facturasFiltradas = filtrarFacturas();
  const totalFacturado = facturasFiltradas.reduce((sum, f) => sum + Number(f.totalFinal), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando facturas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Facturas</h1>
        <p className="text-gray-400">
          Consulta y crea facturas para las órdenes completadas
        </p>
      </div>

      {/* Estadísticas y filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estadísticas */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 text-sm">Total Facturado</p>
              <p className="text-2xl font-bold text-white">{formatearMoneda(totalFacturado)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Facturas</p>
              <p className="text-2xl font-bold text-white">{facturasFiltradas.length}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'todas', label: 'Todas' },
              { value: 'hoy', label: 'Hoy' },
              { value: 'semana', label: 'Esta semana' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFiltro(value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filtro === value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón para crear nueva factura */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Lista de Facturas</h2>
        <Link
          href="/mozo/facturas/crear"
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Nueva Factura
        </Link>
      </div>

      {/* Lista de facturas */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        {facturasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No hay facturas para mostrar</p>
            <p className="text-gray-500 text-sm mt-1">Las facturas aparecerán aquí cuando se generen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">ID</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Cliente</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Mesa</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Subtotal</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Descuento</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Propina</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Total</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Fecha</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {facturasFiltradas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">#{factura.id}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {factura.cliente?.nombre || 'Sin cliente'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      Mesa {factura.orden?.mesa?.numero || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatearMoneda(factura.subtotal)}
                    </td>
                    <td className="px-6 py-4 text-yellow-400">
                      {factura.descuento > 0 ? (
                        factura.tipoDescuento === 'porcentaje' 
                          ? `${factura.descuento}%`
                          : formatearMoneda(factura.descuento)
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-blue-400">
                      {factura.propina > 0 ? formatearMoneda(factura.propina) : '-'}
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      {formatearMoneda(factura.totalFinal)}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {formatearFecha(factura.creadoEn)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/mozo/facturas/${factura.id}`}
                        className="text-orange-400 hover:text-orange-300 font-medium"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}