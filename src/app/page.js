// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');           // ó '/admin' , '/mozo/mesas', etc.
}
