// src/app/admin/platos/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
  listarCategoriasConPlatos,
  crearPlato,
  actualizarPlato,
  eliminarPlato,
} from '@/lib/api/platos';

export default function PlatosAdmin() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({
    nombre:'', descripcion:'', precio:'', categoriaId:''
  });
  const [editId, setEditId]   = useState(null);
  const [seleccion, setSel]   = useState([]);   // ids marcados
  const [busqueda, setBusq]   = useState('');   // 🔍 texto búsqueda
  const [error, setError]     = useState('');

  /* ── cargar datos ── */
  useEffect(() => {
    (async () => {
      try { setCats(await listarCategoriasConPlatos()); }
      catch (e){ setError(e.message); }
      setLoading(false);
    })();
  }, []);

  /* ── helpers selección ── */
  const toggle   = id => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

  /* ── helpers formulario ── */
  const resetForm = () => {
    setEditId(null);
    setForm({ nombre:'', descripcion:'', precio:'', categoriaId:'' });
  };

  /* ── envío ── */
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = async e => {
    e.preventDefault();
    try {
      editId
        ? await actualizarPlato(editId, { ...form, precio:+form.precio })
        : await crearPlato({ ...form, precio:+form.precio });
      location.reload();
    } catch (e){ setError(e.message); }
  };

  /* ── acciones globales ── */
  const nuevoPlato = () => {
    clearSel();
    resetForm();
  };

  const editarSel = () => {
    if (seleccion.length !== 1) return alert('Marca solo un plato para editar');
    const id    = seleccion[0];
    const plato = cats.flatMap(c => c.platos).find(p => p.id === id);
    if (!plato) return;
    setEditId(id);
    setForm({
      nombre:       plato.nombre,
      descripcion:  plato.descripcion,
      precio:       plato.precio,
      categoriaId:  plato.categoriaId ?? ''
    });
    clearSel();
  };

  const eliminarSel = async () => {
    if (!seleccion.length) return;
    if (!confirm(`¿Eliminar ${seleccion.length} plato(s)?`)) return;
    try {
      await Promise.all(seleccion.map(id => eliminarPlato(id)));
      location.reload();
    } catch (e){ alert(e.message); }
  };

  /* ── filtrado por búsqueda ── */
  const filtro = busqueda.toLowerCase();
  const catsFiltrados = cats
    .map(cat => ({
      ...cat,
      platos: cat.platos.filter(p =>
        (p.nombre + p.descripcion).toLowerCase().includes(filtro)
      )
    }))
    .filter(cat => cat.platos.length);

  /* ── UI ── */
  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Platos</h1>

      {/* ── Barra acciones ── */}
      <div className="flex gap-4 items-center">
        <button
          onClick={nuevoPlato}
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

        {/* ── Búsqueda ── */}
        <input
          type="text"
          placeholder="Buscar plato…"
          value={busqueda}
          onChange={e => setBusq(e.target.value)}
          className="ml-auto w-60 px-3 py-2 rounded-lg bg-slate-800 placeholder-slate-400"
        />
      </div>

      {/* ── Formulario ── */}
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-4 gap-4 bg-slate-800/60 p-4 rounded-lg"
      >
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900"
          required
        />
        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900"
          required
        />
        <input
          name="precio" type="number" step="0.01"
          placeholder="Precio"
          value={form.precio}
          onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900"
          required
        />
        <select
          name="categoriaId"
          value={form.categoriaId}
          onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900"
          required
        >
          <option value="">Categoría…</option>
          {cats.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button className="col-span-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
          {editId ? 'Guardar cambios' : 'Crear plato'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* ── Tabla ── */}
      <div className="space-y-8">
        {catsFiltrados.map(cat => (
          <div key={cat.id}>
            <h2 className="text-xl font-medium mb-2">{cat.nombre}</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700">
                  <th className="p-2 w-10 text-center">✓</th>
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Descripción</th>
                  <th className="p-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {cat.platos.map(p => (
                  <tr key={p.id} className="even:bg-slate-800">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={seleccion.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        className="accent-emerald-500"
                      />
                    </td>
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2">{p.descripcion}</td>
                    <td className="p-2">S/ {p.precio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {!catsFiltrados.length && (
          <p className="italic text-center text-slate-400">Sin resultados</p>
        )}
      </div>
    </div>
  );
}
