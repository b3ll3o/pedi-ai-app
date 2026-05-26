import { MainLayout } from '@/components/MainLayout';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  return (
    <MainLayout title="Login">
      <div className="max-w-md mx-auto">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h1 className="text-xl font-bold text-text-primary mb-6 text-center">Entrar na sua conta</h1>
          <form className="space-y-4">
            <Input label="Email" type="email" placeholder="seu@email.com" />
            <Input label="Senha" type="password" placeholder="••••••••" />
            <Button className="w-full">Entrar</Button>
          </form>
          <p className="text-sm text-text-secondary text-center mt-4">
            Não tem conta? <a href="/dashboard" className="text-primary hover:underline">Cadastre-se</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}