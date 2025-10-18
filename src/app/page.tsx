import { redirect } from 'next/navigation';

export default function HomePage() {
  // Перенаправляем на мобильную версию
  redirect('/mobile-home');
}