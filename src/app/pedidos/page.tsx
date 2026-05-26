import { MainLayout } from '@/components/MainLayout';
import { StatusBadge, Table, TableRow, Button } from '@/components/ui';

export default function PedidosPage() {
  return (
    <MainLayout title="Pedidos">
      <Table headers={['Pedido', 'Mesa', 'Itens', 'Total', 'Status', 'Ações']}>
        <TableRow>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">#1023</td>
          <td className="px-4 py-3 text-sm text-text-secondary">Mesa 03</td>
          <td className="px-4 py-3 text-sm text-text-secondary">3 itens</td>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ 127,50</td>
          <td className="px-4 py-3"><StatusBadge status="em_preparo" /></td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Ver</Button>
              <Button variant="ghost" size="sm" className="text-error">Fechar</Button>
            </div>
          </td>
        </TableRow>
        <TableRow>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">#1022</td>
          <td className="px-4 py-3 text-sm text-text-secondary">Mesa 07</td>
          <td className="px-4 py-3 text-sm text-text-secondary">5 itens</td>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ 245,00</td>
          <td className="px-4 py-3"><StatusBadge status="pronto" /></td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Ver</Button>
              <Button variant="ghost" size="sm" className="text-error">Fechar</Button>
            </div>
          </td>
        </TableRow>
        <TableRow>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">#1021</td>
          <td className="px-4 py-3 text-sm text-text-secondary">Mesa 01</td>
          <td className="px-4 py-3 text-sm text-text-secondary">2 itens</td>
          <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ 68,00</td>
          <td className="px-4 py-3"><StatusBadge status="confirmado" /></td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Ver</Button>
              <Button variant="ghost" size="sm" className="text-error">Fechar</Button>
            </div>
          </td>
        </TableRow>
      </Table>
    </MainLayout>
  );
}