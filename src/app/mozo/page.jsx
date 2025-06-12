import { redirect } from 'next/navigation';

/* Al entrar a /mozo redirige al listado de mesas  */
export default function MozoHome() {
  redirect('/mozo/mesas');
}
