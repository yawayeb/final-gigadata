import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    balance: number;
    total_earnings: number;
    is_affiliate: boolean;
    affiliate_expires_at: string | null;
    referral_code: string;
    total_sales: number;
    total_orders: number;
    total_referrals: number;
}

export const useProfile = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        let channel: any;
        if (profile?.id) {
            channel = supabase
                .channel(`profile_${profile.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${profile.id}`
                    },
                    (payload) => {
                        const newProfile = payload.new as Profile;
                        setProfile(newProfile);

                        // Optional: Notify on balance change
                        if (newProfile.balance > profile.balance) {
                            toast({
                                title: "Balance Updated",
                                description: `Your balance has increased to GH¢${newProfile.balance}`,
                            });
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [profile?.id]);

    return { profile, loading, refresh: fetchProfile };
};
