import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { listenToTransactions, listenToLedgerAccounts } from '../firebase/firestore';
import { Transaction, LedgerAccount } from '../types';

interface TransactionsContextType {
  transactions: Transaction[];
  ledgerAccounts: LedgerAccount[];
}

const TransactionsContext = createContext<TransactionsContextType>({
  transactions: [],
  ledgerAccounts: [],
});
export const useTransactions = () => useContext(TransactionsContext);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLedgerAccounts([]);
      return;
    }
    const unsubTransactions = listenToTransactions(user.uid, setTransactions);
    const unsubAccounts = listenToLedgerAccounts(user.uid, setLedgerAccounts);
    return () => {
      unsubTransactions();
      unsubAccounts();
    };
  }, [user]);

  return (
    <TransactionsContext.Provider value={{ transactions, ledgerAccounts }}>
      {children}
    </TransactionsContext.Provider>
  );
}
