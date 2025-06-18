// src/lib/api/mozo.js
/* -------- Mesas -------- */
export async function listarMesas() {
  const r = await fetch('/api/mesas', { credentials: 'include' });
  if (!r.ok) throw new Error('No se pudieron listar mesas');
  return r.json(); // [{ id, numero, estado }]
}

/* -------- Crear orden -------- */
export async function crearOrden(payload) {
  // payload = { mesaId, clienteId?, items:[{ platoId,cantidad }], notas }
  const r = await fetch('/api/ordenes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Error al crear orden');
  return r.json();
}

/* -------- Listar órdenes del mozo -------- */
export async function listarMisOrdenes() {
  const r = await fetch('/api/ordenes', { credentials: 'include' });
  if (!r.ok) throw new Error('No se pudieron listar órdenes');
  return r.json(); // Se filtran en el frontend
}

/* -------- Cambiar estado de una orden -------- */
export async function cambiarEstadoOrden(id, estado) {
  const r = await fetch(`/api/ordenes/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ estado }),
  });
  if (!r.ok) throw new Error('No se pudo cambiar estado');
  return r.json();
}

/* -------- Servir orden (libera mesa) -------- */
export const servirOrden = (id) => cambiarEstadoOrden(id, 'servido');

/* -------- Cancelar orden -------- */
export async function cancelarOrden(id) {
  const r = await fetch(`/api/ordenes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!r.ok) throw new Error('No se pudo cancelar');
  return true;
}

export async function listarClientes () {
  const r = await fetch('/api/clientes', { credentials: 'include' });
  if (!r.ok) throw new Error('No se pudieron listar clientes');
  return r.json();                       // [{ id,nombre,dni,telefono }]
}


/* Editar orden */
export async function editarOrden(id, payload) {
  /* payload puede contener:
     { mesaId, clienteId, cliente:{..}, items:[{platoId,cantidad}], notas } */
  const r = await fetch(`/api/ordenes/${id}`, {
    method      : 'PUT',
    credentials : 'include',
    headers     : { 'Content-Type':'application/json' },
    body        : JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || 'No se pudo editar');
  return r.json();
}

// src/lib/api/mozo.js
export async function listarPlatos({ soloDisponibles = true } = {}) {
  const url = `/api/platos${soloDisponibles ? '?soloDisponibles=1' : ''}`;
  const r   = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error('No se pudieron obtener los platos');

  // 🔽  ⬅️ Aplana y garantiza que todos tengan precio numérico
  return (await r.json())
    .flatMap(c => c.platos)
    .map(p => ({ ...p, precio: Number(p.precio) || 0 }));
}
