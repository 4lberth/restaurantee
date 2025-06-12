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
