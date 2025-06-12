import CocinaSidebar from '@/components/CocinaSidebar';

export const metadata = { title: 'Cocina | Restaurante' };

export default function CocinaLayout({ children }) {
  return (
    <div className="flex">
      <CocinaSidebar />

      <main
        className="ml-56 p-8 w-full min-h-screen
                   bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                   text-white"
      >
        {children}
      </main>
    </div>
  );
}
