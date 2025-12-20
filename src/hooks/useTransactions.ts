import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'topup' | 'purchase' | 'commission' | 'affiliate_fee' | 'withdrawal';
    status: 'pending' | 'success' | 'failed';
    description: string;
    created_at: string;
}

export const useTransactions = (limit = 5) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactions();

        const channel = supabase
            .channel('transaction_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { transactions, loading, refresh: fetchTransactions };
};
