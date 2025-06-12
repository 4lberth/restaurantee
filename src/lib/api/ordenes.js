const base = '/api/ordenes';

export async function listarOrdenes() {
  const res = await fetch(base, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener órdenes');
  return res.json();                         // [{ id, mesa, estado, detalles… }]
}

export async function cambiarEstadoOrden(id, estado) {
  const res = await fetch(`${base}/${id}/estado`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error('Error al cambiar estado');
  return res.json();
}
