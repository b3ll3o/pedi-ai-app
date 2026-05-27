import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Entre na sua conta PediAI e gerencie seu restaurante digitalmente.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}