import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, format, isSameDay, isSameMonth } from 'date-fns';

export interface DashboardStats {
    weeklySales: { name: string; value: number }[];
    monthlySales: { name: string; value: number }[];
    totalWithdrawn: number;
    availableBalance: number;
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        weeklySales: [],
        monthlySales: [],
        totalWithdrawn: 0,
        availableBalance: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch all transactions for the user
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            // 2. Calculate Weekly Sales (Purchases)
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

            const weeklySales = days.map(day => {
                const dayTotal = transactions
                    .filter(t => t.type === 'purchase' && t.status === 'success' && isSameDay(new Date(t.created_at), day))
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                return {
                    name: format(day, 'EEE'),
                    value: dayTotal
                };
            });

            // 3. Calculate Monthly Sales (Purchases)
            const yearStart = startOfMonth(new Date(new Date().getFullYear(), 0, 1));
            const yearEnd = endOfMonth(new Date());
            const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

            const monthlySales = months.map(month => {
                const monthTotal = transactions
                    .filter(t => t.type === 'purchase' && t.status === 'success' && isSameMonth(new Date(t.created_at), month))
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                return {
                    name: format(month, 'MMM'),
                    value: monthTotal
                };
            });

            // 4. Calculate Total Withdrawn
            const totalWithdrawn = transactions
                .filter(t => t.type === 'withdrawal' && (t.status === 'success' || t.status === 'pending'))
                .reduce((sum, t) => sum + Number(t.amount), 0);

            setStats({
                weeklySales,
                monthlySales,
                totalWithdrawn,
                availableBalance: 0, // Profile hook handles this
            });

        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
};
