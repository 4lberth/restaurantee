export async function listarHistorial({ desde, hasta } = {}) {
  const qs = new URLSearchParams();
  if (desde) qs.append('desde', desde);
  if (hasta) qs.append('hasta', hasta);

  const r = await fetch(`/api/ordenes/historial?${qs}`, { credentials:'include' });
  if (!r.ok) throw new Error('No se pudo cargar el historial');
  return r.json();                                            // [{…}]
}
