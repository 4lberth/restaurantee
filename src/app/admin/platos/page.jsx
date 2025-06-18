// src/app/admin/platos/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
  listarCategoriasConPlatos,
  crearPlato,
  actualizarPlato,
  eliminarPlato,
  toggleDisponibilidad,
} from '@/lib/api/platos';

export default function PlatosAdmin() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true
  });
  const [editId, setEditId] = useState(null);
  const [seleccion, setSel] = useState([]);
  const [busqueda, setBusq] = useState('');
  const [error, setError] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos'); // 'todos', 'disponibles', 'no_disponibles'

  useEffect(() => {
    (async () => {
      try { setCats(await listarCategoriasConPlatos()); }
      catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);

  const resetForm = () => {
    setEditId(null);
    setForm({ nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true });
  };

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ 
      ...f, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      editId
        ? await actualizarPlato(editId, { ...form, precio: +form.precio })
        : await crearPlato({ ...form, precio: +form.precio });
      location.reload();
    } catch (e) { setError(e.message); }
  };

  const nuevoPlato = () => {
    clearSel();
    resetForm();
  };

  const editarSel = () => {
    if (seleccion.length !== 1) return alert('Marca solo un plato para editar');
    const id = seleccion[0];
    const plato = cats.flatMap(c => c.platos).find(p => p.id === id);
    if (!plato) return;
    setEditId(id);
    setForm({
      nombre: plato.nombre,
      descripcion: plato.descripcion,
      precio: plato.precio,
      categoriaId: plato.categoriaId ?? '',
      disponible: plato.disponible ?? true
    });
    clearSel();
  };

  const eliminarSel = async () => {
    if (!seleccion.length) return;
    if (!confirm(`¿Eliminar ${seleccion.length} plato(s)?`)) return;
    try {
      await Promise.all(seleccion.map(id => eliminarPlato(id)));
      location.reload();
    } catch (e) { alert(e.message); }
  };

  // Función para cambiar disponibilidad individual
  const cambiarDisponibilidad = async (platoId, disponible) => {
    try {
      await toggleDisponibilidad(platoId, !disponible);
      // Recargar datos
      setCats(await listarCategoriasConPlatos());
    } catch (e) {
      alert('Error al cambiar disponibilidad: ' + e.message);
    }
  };

  // Cambiar disponibilidad de platos seleccionados
  const cambiarDisponibilidadSel = async (disponible) => {
    if (!seleccion.length) return;
    const accion = disponible ? 'marcar como disponibles' : 'marcar como no disponibles';
    if (!confirm(`¿${accion} ${seleccion.length} plato(s)?`)) return;
    
    try {
      await Promise.all(seleccion.map(id => toggleDisponibilidad(id, disponible)));
      setCats(await listarCategoriasConPlatos());
      clearSel();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // Filtrado por búsqueda y disponibilidad
  const filtro = busqueda.toLowerCase();
  const catsFiltrados = cats
    .map(cat => ({
      ...cat,
      platos: cat.platos.filter(p => {
        const coincideBusqueda = (p.nombre + p.descripcion).toLowerCase().includes(filtro);
        const coincideDisponibilidad = 
          filtroDisponibilidad === 'todos' ||
          (filtroDisponibilidad === 'disponibles' && p.disponible) ||
          (filtroDisponibilidad === 'no_disponibles' && !p.disponible);
        
        return coincideBusqueda && coincideDisponibilidad;
      })
    }))
    .filter(cat => cat.platos.length);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Cargando…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Gestión de Platos</h1>
        <p className="text-gray-400">Administra el menú y los platos del restaurante</p>
      </div>

      {/* Barra de acciones */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={nuevoPlato}
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

          {/* Separador */}
          <div className="h-6 w-px bg-gray-600"></div>

          {/* Botones de disponibilidad */}
          <button
            onClick={() => cambiarDisponibilidadSel(true)}
            className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
            disabled={!seleccion.length}
          >
            Marcar disponible
          </button>

          <button
            onClick={() => cambiarDisponibilidadSel(false)}
            className="px-4 py-2 rounded-lg bg-gray-600/80 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
            disabled={!seleccion.length}
          >
            Marcar no disponible
          </button>

          {/* Filtros */}
          <div className="ml-auto flex gap-3 items-center">
            <select
              value={filtroDisponibilidad}
              onChange={e => setFiltroDisponibilidad(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
            >
              <option value="todos">Todos los platos</option>
              <option value="disponibles">Solo disponibles</option>
              <option value="no_disponibles">Solo no disponibles</option>
            </select>

            <input
              type="text"
              placeholder="Buscar plato…"
              value={busqueda}
              onChange={e => setBusq(e.target.value)}
              className="w-60 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">
          {editId ? 'Editar Plato' : 'Nuevo Plato'}
        </h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="nombre"
            placeholder="Nombre del plato"
            value={form.nombre}
            onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />
          <input
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />
          <input
            name="precio" type="number" step="0.01"
            placeholder="Precio (S/)"
            value={form.precio}
            onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />
          <select
            name="categoriaId"
            value={form.categoriaId}
            onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          >
            <option value="">Seleccionar categoría…</option>
            {cats.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          {/* Checkbox de disponibilidad */}
          <div className="md:col-span-4 flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="disponible"
                checked={form.disponible}
                onChange={onChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-white font-medium">Plato disponible</span>
            </label>
          </div>

          <button className="md:col-span-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25">
            {editId ? 'Guardar cambios' : 'Crear plato'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tablas por categoría */}
      <div className="space-y-6">
        {catsFiltrados.map(cat => (
          <div key={cat.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-600">
              <h2 className="text-xl font-medium text-white">{cat.nombre}</h2>
              <p className="text-gray-400 text-sm">
                {cat.platos.length} platos
                {filtroDisponibilidad !== 'todos' && (
                  <span className="ml-2">
                    ({filtroDisponibilidad === 'disponibles' ? 'disponibles' : 'no disponibles'})
                  </span>
                )}
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/30 border-b border-gray-600">
                  <th className="p-4 w-12 text-center text-gray-300">
                    <input
                      type="checkbox"
                      onChange={e => {
                        const platosIds = cat.platos.map(p => p.id);
                        setSel(prev => e.target.checked 
                          ? [...new Set([...prev, ...platosIds])]
                          : prev.filter(id => !platosIds.includes(id))
                        );
                      }}
                      className="accent-orange-500"
                    />
                  </th>
                  <th className="p-4 text-left text-gray-300 font-medium">Nombre</th>
                  <th className="p-4 text-left text-gray-300 font-medium">Descripción</th>
                  <th className="p-4 text-left text-gray-300 font-medium">Precio</th>
                  <th className="p-4 text-center text-gray-300 font-medium">Estado</th>
                  <th className="p-4 text-center text-gray-300 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cat.platos.map(p => (
                  <tr key={p.id} className={`border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors duration-150 ${!p.disponible ? 'opacity-75' : ''}`}>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={seleccion.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        className="accent-orange-500"
                      />
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${p.disponible ? 'text-white' : 'text-gray-400 line-through'}`}>
                        {p.nombre}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{p.descripcion}</td>
                    <td className="p-4 text-orange-400 font-semibold">S/ {p.precio.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        p.disponible 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {p.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => cambiarDisponibilidad(p.id, p.disponible)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          p.disponible
                            ? 'bg-red-600/80 hover:bg-red-700 text-white'
                            : 'bg-green-600/80 hover:bg-green-700 text-white'
                        }`}
                        title={p.disponible ? 'Marcar como no disponible' : 'Marcar como disponible'}
                      >
                        {p.disponible ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {!catsFiltrados.length && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <p className="text-center text-gray-400 italic">
              {busqueda || filtroDisponibilidad !== 'todos' 
                ? 'No se encontraron platos que coincidan con los filtros' 
                : 'No hay platos registrados'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}