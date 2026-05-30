'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { CriarRestauranteDto, AtualizarRestauranteDto } from '@/lib/api';

interface RestauranteFormProps {
  initialData?: {
    id: string;
    nome: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    horarioAbertura: string;
    horarioFechamento: string;
  };
  onSubmitCriar?: (data: CriarRestauranteDto) => Promise<void>;
  onSubmitAtualizar?: (data: AtualizarRestauranteDto) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calcDigit = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calcDigit(digits.slice(0, 12), weights1);
  const d2 = calcDigit(digits.slice(0, 13), weights2);

  return d1 === parseInt(digits[12]) && d2 === parseInt(digits[13]);
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function RestauranteForm({
  initialData,
  onSubmitCriar,
  onSubmitAtualizar,
  loading,
  submitLabel,
}: RestauranteFormProps) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [cnpj, setCnpj] = useState(initialData?.cnpj || '');
  const [endereco, setEndereco] = useState(initialData?.endereco || '');
  const [cidade, setCidade] = useState(initialData?.cidade || '');
  const [estado, setEstado] = useState(initialData?.estado || '');
  const [cep, setCep] = useState(initialData?.cep || '');
  const [horarioAbertura, setHorarioAbertura] = useState(initialData?.horarioAbertura || '');
  const [horarioFechamento, setHorarioFechamento] = useState(initialData?.horarioFechamento || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
    else if (!validateCNPJ(cnpj)) newErrors.cnpj = 'CNPJ inválido';
    if (!endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
    if (!cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!estado.trim()) newErrors.estado = 'Estado é obrigatório';
    if (!cep.trim()) newErrors.cep = 'CEP é obrigatório';
    else if (cep.replace(/\D/g, '').length !== 8) newErrors.cep = 'CEP inválido';
    if (!horarioAbertura.trim()) newErrors.horarioAbertura = 'Horário de abertura é obrigatório';
    if (!horarioFechamento.trim())
      newErrors.horarioFechamento = 'Horário de fechamento é obrigatório';
    if (horarioAbertura && horarioFechamento && horarioAbertura >= horarioFechamento) {
      newErrors.horarioFechamento = 'Horário de fechamento deve ser após abertura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmitCriar && !initialData) {
      await onSubmitCriar({
        nome,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
        horarioAbertura,
        horarioFechamento,
      });
    } else if (onSubmitAtualizar && initialData) {
      await onSubmitAtualizar({
        nome,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
        horarioAbertura,
        horarioFechamento,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do Restaurante"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Restaurante Exemplo"
          error={errors.nome}
          required
        />
        <Input
          label="CNPJ"
          value={cnpj}
          onChange={handleCNPJChange}
          placeholder="XX.XXX.XXX/XXXX-XX"
          error={errors.cnpj}
          required
        />
      </div>

      <Input
        label="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        placeholder="Rua exemplo, 123"
        error={errors.endereco}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="São Paulo"
          error={errors.cidade}
          required
        />
        <Input
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value.toUpperCase())}
          placeholder="SP"
          maxLength={2}
          error={errors.estado}
          required
        />
        <Input
          label="CEP"
          value={cep}
          onChange={handleCEPChange}
          placeholder="XXXXX-XXX"
          error={errors.cep}
          maxLength={9}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Horário de Abertura"
          type="time"
          value={horarioAbertura}
          onChange={(e) => setHorarioAbertura(e.target.value)}
          error={errors.horarioAbertura}
          required
        />
        <Input
          label="Horário de Fechamento"
          type="time"
          value={horarioFechamento}
          onChange={(e) => setHorarioFechamento(e.target.value)}
          error={errors.horarioFechamento}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} className="flex-1">
          {submitLabel || (initialData ? 'Salvar Alterações' : 'Criar Restaurante')}
        </Button>
      </div>
    </form>
  );
}
