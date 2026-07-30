export type DebtStatus = 'active' | 'returned';

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  item_name: string;
  amount: number | null;
  currency: string;
  description: string;
  lent_at: string;
  due_at: string | null;
  status: DebtStatus;
  photo_path: string | null;
  pinned: boolean;
  reminder_3d_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtInput {
  person_name: string;
  item_name: string;
  amount: number | null;
  currency: string;
  description: string;
  lent_at: string;
  due_at: string | null;
  status: DebtStatus;
}

export type DebtSort = 'date' | 'amount' | 'name' | 'due';
