export function calcularTotal(detalles = []) {
  return detalles.reduce((sum, item) => sum + item.subtotal, 0);
}
