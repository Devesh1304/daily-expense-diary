import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Direction, LedgerAccount, LedgerCategory, Transaction } from '../types';

function toMillis(value: any): number {
  if (value instanceof Timestamp) return value.toMillis();
  return value ?? 0;
}

// ---------- Ledger accounts ----------

export async function getOrCreateLedgerAccount(
  userId: string,
  name: string,
  category: LedgerCategory = 'other'
): Promise<{ id: string; category: LedgerCategory }> {
  const trimmed = name.trim();
  const q = query(
    collection(db, 'ledgerAccounts'),
    where('userId', '==', userId),
    where('name', '==', trimmed)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const existing = snap.docs[0];
    return { id: existing.id, category: existing.data().category };
  }
  const ref = await addDoc(collection(db, 'ledgerAccounts'), {
    userId,
    name: trimmed,
    category,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, category };
}

export function listenToLedgerAccounts(
  userId: string,
  callback: (accounts: LedgerAccount[]) => void
): () => void {
  const q = query(collection(db, 'ledgerAccounts'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const accounts = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        name: data.name,
        category: data.category,
        createdAt: toMillis(data.createdAt),
      } as LedgerAccount;
    });
    callback(accounts);
  });
}

export async function deleteLedgerAccount(accountId: string, userId: string): Promise<void> {
  const txQuery = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('accountId', '==', accountId)
  );
  const txSnap = await getDocs(txQuery);
  const deletes = txSnap.docs.map((d) => deleteDoc(doc(db, 'transactions', d.id)));
  await Promise.all(deletes);
  await deleteDoc(doc(db, 'ledgerAccounts', accountId));
}

export async function updateLedgerAccountCategory(
  accountId: string,
  category: LedgerCategory
): Promise<void> {
  await updateDoc(doc(db, 'ledgerAccounts', accountId), { category });
}

// ---------- Transactions ----------

export interface NewTransactionInput {
  userId: string;
  direction: Direction;
  date: string;
  amount: number;
  accountName: string;
  remarks: string;
  category?: LedgerCategory;
}

export async function createTransaction(input: NewTransactionInput): Promise<void> {
  const account = await getOrCreateLedgerAccount(input.userId, input.accountName, input.category ?? 'other');

  await addDoc(collection(db, 'transactions'), {
    userId: input.userId,
    direction: input.direction,
    date: input.date,
    amount: input.amount,
    accountId: account.id,
    accountName: input.accountName.trim(),
    remarks: input.remarks ?? '',
    createdAt: serverTimestamp(),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, 'transactions', id));
}

export interface EditTransactionInput {
  date: string;
  amount: number;
  accountName: string;
  remarks: string;
}

export async function updateTransactionWithAccount(
  id: string,
  userId: string,
  input: EditTransactionInput
): Promise<void> {
  const account = await getOrCreateLedgerAccount(userId, input.accountName, 'other');
  await updateDoc(doc(db, 'transactions', id), {
    date: input.date,
    amount: input.amount,
    accountId: account.id,
    accountName: input.accountName.trim(),
    remarks: input.remarks ?? '',
  });
}

// Real-time listener for every transaction belonging to a user.
export function listenToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const transactions = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        direction: data.direction,
        date: data.date,
        amount: data.amount,
        accountId: data.accountId,
        accountName: data.accountName,
        remarks: data.remarks ?? '',
        createdAt: toMillis(data.createdAt),
      } as Transaction;
    });
    callback(transactions);
  });
}
