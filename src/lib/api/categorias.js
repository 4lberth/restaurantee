const base = '/api/categorias';

export async function listarCategorias() {
  const res = await fetch(base, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener las categorías');
  return res.json();                      // [{ id, nombre, platos:[…] }]
}

export async function crearCategoria(nombre) {
  const res = await fetch(base, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ nombre }),
  });
  if (!res.ok) throw new Error('Error al crear categoría');
  return res.json();
}

export async function actualizarCategoria(id, nombre) {
  const res = await fetch(`${base}/${id}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ nombre }),
  });
  if (!res.ok) throw new Error('Error al actualizar');
  return res.json();
}

export async function eliminarCategoria(id) {
  const res = await fetch(`${base}/${id}`, {
    method:'DELETE',
    credentials:'include',
  });
  if (!res.ok) throw new Error('Error al eliminar');
  return true;
}
