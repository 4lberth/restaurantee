'use client';
import { useEffect, useState } from 'react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '@/lib/api/usuarios';

export default function UsuariosAdmin() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm]       = useState({
    nombre:'', email:'', password:'', rol:'mozo'
  });
  const [editId, setEditId]   = useState(null);

  const [seleccion, setSel]   = useState([]);  // ids marcados
  const [busq, setBusq]       = useState('');
  const [error, setError]     = useState('');

  /* cargar */
  useEffect(() => {
    (async () => {
      try { setUsers(await listarUsuarios()); }
      catch (e){ setError(e.message); }
      setLoading(false);
    })();
  }, []);

  /* selección */
  const toggle = id =>
    setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const clearSel = () => setSel([]);

  /* helpers form */
  const resetForm = () => {
    setEditId(null);
    setForm({ nombre:'', email:'', password:'', rol:'mozo' });
  };
  const onChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* submit */
  const onSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await actualizarUsuario(editId, { nombre: form.nombre, rol: form.rol });
      } else {
        await crearUsuario(form);   // incluye password
      }
      location.reload();
    } catch (e){ setError(e.message); }
  };

  /* acciones barra */
  const nuevo = () => { clearSel(); resetForm(); };

  const editarSel = () => {
    if (seleccion.length !== 1) return alert('Marca un usuario');
    const u = users.find(x => x.id === seleccion[0]);
    if (!u) return;
    setEditId(u.id);
    setForm({ nombre:u.nombre, email:u.email, password:'', rol:u.rol });
    clearSel();
  };

  const eliminarSel = async () => {
    if (!seleccion.length) return;
    if (!confirm(`¿Eliminar ${seleccion.length} usuario(s)?`)) return;
    try {
      await Promise.all(seleccion.map(id => eliminarUsuario(id)));
      location.reload();
    } catch (e){ alert(e.message); }
  };

  /* filtrado búsqueda */
  const filtro   = busq.toLowerCase();
  const usersFil = users.filter(u =>
    (u.nombre+u.email+u.rol).toLowerCase().includes(filtro)
  );

  /* UI */
  if (loading) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>

      {/* Barra acciones */}
      <div className="flex gap-4 items-center">
        <button
          onClick={nuevo}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-700"
        >Nuevo</button>

        <button
          onClick={editarSel}
          className="px-4 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-600 disabled:opacity-40"
          disabled={seleccion.length !== 1}
        >Editar</button>

        <button
          onClick={eliminarSel}
          className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 disabled:opacity-40"
          disabled={!seleccion.length}
        >Eliminar</button>

        <input
          type="text"
          placeholder="Buscar usuario…"
          value={busq}
          onChange={e => setBusq(e.target.value)}
          className="ml-auto w-60 px-3 py-2 rounded-lg bg-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Formulario */}
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-4 gap-4 bg-slate-800/60 p-4 rounded-lg"
      >
        <input
          name="nombre" placeholder="Nombre"
          value={form.nombre} onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900" required/>

        <input
          name="email" type="email" placeholder="Email"
          value={form.email} onChange={onChange}
          className="col-span-1 px-3 py-2 rounded-lg bg-slate-900"
          required disabled={!!editId}           /* email no cambia en edición */

        />
        {!editId && (
          <input
            name="password" type="password" placeholder="Contraseña"
            value={form.password} onChange={onChange}
            className="col-span-1 px-3 py-2 rounded-lg bg-slate-900" required
          />
        )}
        <select
          name="rol" value={form.rol} onChange={onChange}
          className={`col-span-1 px-3 py-2 rounded-lg bg-slate-900
                      ${editId ? 'col-span-2' : ''}`}
        >
          <option value="mozo">Mozo</option>
          <option value="admin">Admin</option>
          <option value="cocina">Cocina</option>
        </select>

        <button className="col-span-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
          {editId ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* Tabla */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 w-10 text-center">✓</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rol</th>
          </tr>
        </thead>
        <tbody>
          {usersFil.map(u => (
            <tr key={u.id} className="even:bg-slate-800">
              <td className="p-2 text-center">
                <input type="checkbox"
                       checked={seleccion.includes(u.id)}
                       onChange={() => toggle(u.id)}
                       className="accent-emerald-500" />
              </td>
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 capitalize">{u.rol}</td>
            </tr>
          ))}
          {!usersFil.length && (
            <tr>
              <td colSpan={4}
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
