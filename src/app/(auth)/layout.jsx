export const metadata = { title: 'Auth | Restaurante' };

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
