const base = '/api/mesas';

export async function listarMesas() {
  const res = await fetch(base, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudieron obtener las mesas');
  return res.json();                     // [{ id, numero, estado }]
}

export async function crearMesa(numero) {
  const res = await fetch(base, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ numero }),
  });
  if (!res.ok) throw new Error('Error al crear mesa');
  return res.json();
}

export async function cambiarEstadoMesa(id, estado) {
  const res = await fetch(`${base}/${id}/estado`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body:JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}
