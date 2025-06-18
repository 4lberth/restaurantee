// src/lib/api/platos.js
const base = '/api/platos';

export async function listarCategoriasConPlatos() {
  const res = await fetch(base, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener los platos');
  return res.json();                         // [{ id, nombre, platos:[…] }]
}

export async function crearPlato(data) {
  // { nombre, descripcion, precio, categoriaId, disponible }
  const res = await fetch(base, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear plato');
  return res.json();
}

export async function actualizarPlato(id, data) {
  const res = await fetch(`${base}/${id}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar plato');
  return res.json();
}

export async function eliminarPlato(id) {
  const res = await fetch(`${base}/${id}`, {
    method:'DELETE',
    credentials:'include',
  });
  if (!res.ok) throw new Error('Error al eliminar plato');
  return true;
}

// Nueva función para cambiar disponibilidad
export async function toggleDisponibilidad(id, disponible) {
  const res = await fetch(`${base}/${id}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ disponible }),
  });
  if (!res.ok) throw new Error('Error al cambiar disponibilidad');
  return res.json();
}