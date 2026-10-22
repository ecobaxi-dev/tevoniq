'use client';
import { useState, type ReactNode } from 'react';
import { Button, Input, Modal } from '@tevoniq/ui';
export function ConfirmAction({
  label,
  title,
  description,
  children,
  disabled = false,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
  disabled?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [word, setWord] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal
      trigger={
        <Button variant="secondary" disabled={disabled}>
          {label}
        </Button>
      }
      title={title}
      description={description}
      closeLabel="Cancel"
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setWord('');
          setError('');
        }
      }}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={word !== 'CONFIRM'}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                await onConfirm();
                setOpen(false);
                setWord('');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Action failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirm action
          </Button>
        </>
      }
    >
      {children}
      <Input
        label="Type CONFIRM to continue"
        value={word}
        autoComplete="off"
        onChange={(e) => setWord(e.target.value)}
        disabled={busy}
      />
      {error && <p role="alert">{error}</p>}
    </Modal>
  );
}
