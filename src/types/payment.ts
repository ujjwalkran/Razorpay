import type { LucideIcon } from 'lucide-react';

export type PaymentMethod = 'upi' | 'card' | 'bank';

export type PaymentStatus = 'Captured' | 'Authorized' | 'Failed';

export type Transaction = {
  id: string;
  customer: string;
  method: string;
  amount: string;
  status: PaymentStatus;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
};

export type PaymentMethodCard = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export type PaymentResult = {
  status: 'success' | 'failure';
  title: string;
  message: string;
  reference: string;
};
