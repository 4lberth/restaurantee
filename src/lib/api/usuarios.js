const base = '/api/usuarios';

export async function listarUsuarios() {
  const res = await fetch(base, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener los usuarios');
  return res.json();                       // [{ id, nombre, email, rol }]
}

export async function crearUsuario(data) {
  // { nombre, email, password, rol }
  const res = await fetch(base, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return res.json();
}

export async function actualizarUsuario(id, data) {
  // { nombre, rol }
  const res = await fetch(`${base}/${id}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
}

export async function eliminarUsuario(id) {
  const res = await fetch(`${base}/${id}`, {
    method:'DELETE',
    credentials:'include',
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return true;
}
