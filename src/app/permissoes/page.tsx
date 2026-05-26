import { redirect } from 'next/navigation';

export default function PermissoesRedirect() {
  redirect('/dashboard/permissoes');
}
