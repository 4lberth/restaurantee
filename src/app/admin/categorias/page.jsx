'use client';
import { useEffect, useState } from 'react';
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '@/lib/api/categorias';

export default function CategoriasAdmin() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre]   = useState('');
  const [editId, setEditId]   = useState(null);
  const [seleccion, setSel]   = useState([]);  // ids marcados
  const [busqueda, setBusq]   = useState('');
  const [error, setError]     = useState('');

  /* cargar datos */
  useEffect(() => {
    (async () => {
      try { setCats(await listarCategorias()); }
      catch (e){ setError(e.message); }
      setLoading(false);
    })();
  }, []);

  /* selección */
  const toggle   = id => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

  /* crear / actualizar */
  const onSubmit = async e => {
    e.preventDefault();
    try {
      editId
        ? await actualizarCategoria(editId, nombre)
        : await crearCategoria(nombre);
      location.reload();
    } catch (e){ setError(e.message); }
  };

  /* acciones globales */
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
    } catch (e){ alert(e.message); }
  };

  /* búsqueda */
  const filtro  = busqueda.toLowerCase();
  const catsFil = cats.filter(c => c.nombre.toLowerCase().includes(filtro));

  /* UI */
  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Categorías</h1>

      {/* Barra acciones */}
      <div className="flex gap-4 items-center">
        <button
          onClick={nuevoCat}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700"
        >
          Nuevo
        </button>
        <button
          onClick={editarSel}
          className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-600 disabled:opacity-40"
          disabled={seleccion.length !== 1}
        >
          Editar
        </button>
        <button
          onClick={eliminarSel}
          className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 disabled:opacity-40"
          disabled={!seleccion.length}
        >
          Eliminar
        </button>

        <input
          type="text"
          placeholder="Buscar categoría…"
          value={busqueda}
          onChange={e => setBusq(e.target.value)}
          className="ml-auto w-60 px-3 py-2 rounded-lg bg-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Formulario */}
      <form
        onSubmit={onSubmit}
        className="flex gap-4 bg-slate-800/60 p-4 rounded-lg w-fit"
      >
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-900"
          required
        />
        <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
          {editId ? 'Guardar' : 'Crear'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* Tabla */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 w-10 text-center">✓</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Platos asociados</th>
          </tr>
        </thead>
        <tbody>
          {catsFil.map(c => (
            <tr key={c.id} className="even:bg-slate-800">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={seleccion.includes(c.id)}
                  onChange={() => toggle(c.id)}
                  className="accent-emerald-500"
                />
              </td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.platos.length}</td>
            </tr>
          ))}
          {!catsFil.length && (
            <tr>
              <td colSpan={3}
                  className="p-2 italic text-center text-slate-400">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
