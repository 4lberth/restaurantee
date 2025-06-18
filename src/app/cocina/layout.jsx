import CocinaSidebar from '@/components/CocinaSidebar';

export const metadata = { 
  title: 'Cocina | RestaurantApp',
  description: 'Panel de gestión de órdenes para cocina'
};

export default function CocinaLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <CocinaSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}