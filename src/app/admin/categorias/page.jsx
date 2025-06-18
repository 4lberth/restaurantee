// src/app/admin/categorias/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '@/lib/api/categorias';

export default function CategoriasAdmin() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const [seleccion, setSel] = useState([]);
  const [busqueda, setBusq] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setCats(await listarCategorias()); }
      catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);

  const onSubmit = async e => {
    e.preventDefault();
    try {
      editId
        ? await actualizarCategoria(editId, nombre)
        : await crearCategoria(nombre);
      location.reload();
    } catch (e) { setError(e.message); }
  };

  const nuevoCat = () => {
    clearSel();
    setEditId(null);
    setNombre('');
  };

  const editarSel = () => {
    if (seleccion.length !== 1) return alert('Marca una categoría');
    const cat = cats.find(c => c.id === seleccion[0]);
    if (!cat) return;
    setEditId(cat.id);
    setNombre(cat.nombre);
    clearSel();
  };

  const eliminarSel = async () => {
    if (!seleccion.length) return;
    if (!confirm(`¿Eliminar ${seleccion.length} categoría(s)?`)) return;
    try {
      await Promise.all(seleccion.map(id => eliminarCategoria(id)));
      location.reload();
    } catch (e) { alert(e.message); }
  };

  const filtro = busqueda.toLowerCase();
  const catsFil = cats.filter(c => c.nombre.toLowerCase().includes(filtro));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Cargando…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Gestión de Categorías</h1>
        <p className="text-gray-400">Administra las categorías de platos del menú</p>
      </div>

      {/* Barra de acciones */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={nuevoCat}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            Nuevo
          </button>
          <button
            onClick={editarSel}
            className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
            disabled={seleccion.length !== 1}
          >
            Editar
          </button>
          <button
            onClick={eliminarSel}
            className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
            disabled={!seleccion.length}
          >
            Eliminar
          </button>

          <input
            type="text"
            placeholder="Buscar categoría…"
            value={busqueda}
            onChange={e => setBusq(e.target.value)}
            className="ml-auto w-60 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">
          {editId ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <form onSubmit={onSubmit} className="flex gap-4">
          <input
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25">
            {editId ? 'Guardar' : 'Crear'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50 border-b border-gray-600">
              <th className="p-4 w-12 text-center text-gray-300">
                <input
                  type="checkbox"
                  onChange={e => setSel(e.target.checked ? cats.map(c => c.id) : [])}
                  className="accent-orange-500"
                />
              </th>
              <th className="p-4 text-left text-gray-300 font-medium">Nombre</th>
              <th className="p-4 text-left text-gray-300 font-medium">Platos asociados</th>
            </tr>
          </thead>
          <tbody>
            {catsFil.map(c => (
              <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-150">
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={seleccion.includes(c.id)}
                    onChange={() => toggle(c.id)}
                    className="accent-orange-500"
                  />
                </td>
                <td className="p-4 text-white font-medium">{c.nombre}</td>
                <td className="p-4 text-gray-300">{c.platos.length} platos</td>
              </tr>
            ))}
            {!catsFil.length && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                  {busqueda ? 'No se encontraron categorías que coincidan con la búsqueda' : 'No hay categorías registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}