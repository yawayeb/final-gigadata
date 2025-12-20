import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface DataPackage {
    id: string;
    network: string;
    name: string;
    size: string;
    price: number;
    validity: string;
}

export const useDataPackages = (network?: string) => {
    const [packages, setPackages] = useState<DataPackage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('data_packages')
                .select('*')
                .eq('is_active', true);

            if (network) {
                query = query.eq('network', network);
            }

            const { data, error } = await query.order('price', { ascending: true });

            if (error) throw error;
            if (data) setPackages(data);
        } catch (err) {
            console.error('Error fetching packages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [network]);

    return { packages, loading, refresh: fetchPackages };
};
