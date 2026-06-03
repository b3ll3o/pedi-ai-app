'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmação acessível que substitui `window.confirm()`. Reusa o `Modal`
 * (ESC, foco, body scroll lock) e adiciona dois botões explícitos.
 *
 * `variant='danger'` é o default: exclusões são irreversíveis e o botão
 * precisa ser visualmente distinto para desencorajar clique acidental.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-5">
        {variant === 'danger' && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error" aria-hidden="true" />
          </div>
        )}
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
