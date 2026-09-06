export interface ConfirmConfig {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  destructive?: boolean;
  confirmationPhrase?: string;
  confirmationHint?: string;
}
