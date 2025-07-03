// src/app/admin/usuarios/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '@/lib/api/usuarios';

export default function UsuariosAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: '', email: '', password: '', rol: 'mozo'
  });
  const [editId, setEditId] = useState(null);

  const [seleccion, setSel] = useState([]);
  const [busq, setBusq] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setUsers(await listarUsuarios()); }
      catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, []);

  const toggle = id =>
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);

  const resetForm = () => {
    setEditId(null);
    setForm({ nombre: '', email: '', password: '', rol: 'mozo' });
  };
  const onChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await actualizarUsuario(editId, { nombre: form.nombre, rol: form.rol });
      } else {
        await crearUsuario(form);
      }
      location.reload();
    } catch (e) { setError(e.message); }
  };

  const nuevo = () => { clearSel(); resetForm(); };

  const editarSel = () => {
    if (seleccion.length !== 1) return alert('Marca un usuario');
    const u = users.find(x => x.id === seleccion[0]);
    if (!u) return;
    setEditId(u.id);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    clearSel();
  };

  const eliminarSel = async () => {
    if (!seleccion.length) return;
    if (!confirm(`¿Eliminar ${seleccion.length} usuario(s)?`)) return;
    try {
      await Promise.all(seleccion.map(id => eliminarUsuario(id)));
      location.reload();
    } catch (e) { alert(e.message); }
  };

  const filtro = busq.toLowerCase();
  const usersFil = users.filter(u =>
    (u.nombre + u.email + u.rol).toLowerCase().includes(filtro)
  );

  const getRolBadge = (rol) => {
    const styles = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      cocina: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      mozo: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return styles[rol] || styles.mozo;
  };

  // Verificar si el usuario en edición es admin
  const usuarioEnEdicion = editId ? users.find(u => u.id === editId) : null;
  const esUsuarioAdmin = usuarioEnEdicion?.rol === 'admin';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Cargando…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">Administra el personal y sus roles de acceso</p>
      </div>

      {/* Barra de acciones */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={nuevo}
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
            placeholder="Buscar usuario…"
            value={busq}
            onChange={e => setBusq(e.target.value)}
            className="ml-auto w-60 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">
          {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        
        {/* Mensaje de advertencia para usuarios admin */}
        {esUsuarioAdmin && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ No se puede modificar el rol de un usuario administrador por seguridad
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="nombre" placeholder="Nombre completo"
            value={form.nombre} onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required
          />

          <input
            name="email" type="email" placeholder="Email"
            value={form.email} onChange={onChange}
            className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
            required disabled={!!editId}
          />

          {!editId && (
            <input
              name="password" type="password" placeholder="Contraseña"
              value={form.password} onChange={onChange}
              className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
              required
            />
          )}

          <select
            name="rol" value={form.rol} onChange={onChange}
            disabled={esUsuarioAdmin}
            className={`px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-orange-500 transition-colors duration-200 ${editId ? 'md:col-span-2' : ''} ${esUsuarioAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="mozo">Mozo</option>
            <option value="admin">Admin</option>
            <option value="cocina">Cocina</option>
          </select>

          <button className="md:col-span-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25">
            {editId ? 'Guardar cambios' : 'Crear usuario'}
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
                  onChange={e => setSel(e.target.checked ? users.map(u => u.id) : [])}
                  className="accent-orange-500"
                />
              </th>
              <th className="p-4 text-left text-gray-300 font-medium">Nombre</th>
              <th className="p-4 text-left text-gray-300 font-medium">Email</th>
              <th className="p-4 text-left text-gray-300 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usersFil.map(u => (
              <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-150">
                <td className="p-4 text-center">
                  <input type="checkbox"
                    checked={seleccion.includes(u.id)}
                    onChange={() => toggle(u.id)}
                    className="accent-orange-500"
                  />
                </td>
                <td className="p-4 text-white font-medium">{u.nombre}</td>
                <td className="p-4 text-gray-300">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRolBadge(u.rol)}`}>
                    {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
            {!usersFil.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                  {busq ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}