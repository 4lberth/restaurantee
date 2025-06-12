// src/app/admin/page.jsx
export const dynamic = 'force-dynamic';          // evita caching en dev

export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p>Bienvenido, selecciona una sección en el panel izquierdo.</p>
      {/* Aquí irán cards, métricas, etc. */}
    </div>
  );
}
