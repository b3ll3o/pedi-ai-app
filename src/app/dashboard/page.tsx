import { MainLayout } from '@/components/MainLayout';
import { Card, StatusBadge } from '@/components/ui';

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Vendas do Dia" value="R$ 2.450,00" trend="+12%" positive />
        <StatCard title="Pedidos" value="47" trend="+8%" positive />
        <StatCard title="Ticket Médio" value="R$ 52,13" trend="-3%" positive={false} />
        <StatCard title="Mesas Ocupadas" value="8/12" trend="" positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pedidos em Andamento">
          <div className="space-y-3">
            <OrderItem mesa="Mesa 03" itens="3 itens" tempo="12 min" status="em_preparo" />
            <OrderItem mesa="Mesa 07" itens="5 itens" tempo="8 min" status="pronto" />
            <OrderItem mesa="Mesa 01" itens="2 itens" tempo="3 min" status="em_preparo" />
            <OrderItem mesa="Bar" itens="4 itens" tempo="5 min" status="confirmado" />
          </div>
        </Card>

        <Card title="Produtos Mais Vendidos">
          <div className="space-y-3">
            <ProductItem nome="Picanha na Brasa" vendas={28} />
            <ProductItem nome="Risoto de Camarão" vendas={22} />
            <ProductItem nome="Salada Caesar" vendas={19} />
            <ProductItem nome="Suco de Laranja" vendas={45} />
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value, trend, positive }: { title: string; value: string; trend: string; positive: boolean }) {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border">
      <p className="text-sm text-text-secondary mb-2">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {trend && (
        <p className={`text-sm mt-2 ${positive ? 'text-success' : 'text-error'}`}>
          {trend} vs ontem
        </p>
      )}
    </div>
  );
}

function OrderItem({ mesa, itens, tempo, status }: { mesa: string; itens: string; tempo: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
      <div>
        <p className="font-medium text-text-primary">{mesa}</p>
        <p className="text-sm text-text-secondary">{itens} • {tempo}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function ProductItem({ nome, vendas }: { nome: string; vendas: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
      <p className="font-medium text-text-primary">{nome}</p>
      <p className="text-sm font-semibold text-text-secondary">{vendas} vendas</p>
    </div>
  );
}