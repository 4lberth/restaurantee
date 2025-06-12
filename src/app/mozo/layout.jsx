import MozoSidebar from '@/components/MozoSidebar';

export const metadata = { title:'Mozo | Restaurante' };

export default function MozoLayout({ children }) {
  return (
    <div className="flex">
      <MozoSidebar />
      <main
        className="ml-56 p-8 min-h-screen w-full
                   bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                   text-white"
      >
        {children}
      </main>
    </div>
  );
}
