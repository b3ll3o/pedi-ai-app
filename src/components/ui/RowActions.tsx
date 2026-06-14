'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface RowActionsProps {
  /** Texto usado em `aria-label` (ex: "Editar usuário João"). */
  editLabel: string;
  /** Texto usado em `aria-label` (ex: "Excluir usuário João"). */
  deleteLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Par de ações de linha (editar/excluir) usadas nas tabelas CRUD.
 *
 * Centraliza:
 * - Visual idêntico (opacity-80 + group-hover:opacity-100)
 * - `aria-label` em ambos os botões (corrige a inconsistência de alguns
 *   lugares que tinham só no "Excluir")
 * - Variante `danger` no botão de excluir
 */
export function RowActions({ editLabel, deleteLabel, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={editLabel}>
          <Edit2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={deleteLabel}
          className="text-error hover:bg-error/10"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
