-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    is_affiliate BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    total_sales DECIMAL(12, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT CHECK (type IN ('topup', 'purchase', 'commission', 'affiliate_fee', 'withdrawal')),
    status TEXT CHECK (status IN ('pending', 'success', 'failed')),
    description TEXT,
    reference TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can lookup profiles" ON public.profiles;
CREATE POLICY "Authenticated users can lookup profiles" ON public.profiles
    FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
CREATE POLICY "Allow profile creation on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, referred_by)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        (NULLIF(NEW.raw_user_meta_data->>'referred_by', ''))::UUID
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On auth.user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Logic: Handle Affiliate Payment and Commissions
CREATE OR REPLACE FUNCTION public.handle_affiliate_activation()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID;
    v_ref_code TEXT;
BEGIN
    -- PART A: Handle Affiliate Program Activation (50 GHS Fee)
    IF NEW.type = 'affiliate_fee' AND NEW.status = 'success' THEN
        
        -- A. Generate unique referral code if not exists
        v_ref_code := UPPER(SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', ''), 1, 8));
        
        -- B. Mark user as affiliate
        UPDATE public.profiles
        SET is_affiliate = TRUE,
            referral_code = COALESCE(referral_code, 'EDUHUB-' || v_ref_code)
        WHERE id = NEW.user_id;

        -- C. Handle commission for referrer
        SELECT referred_by INTO v_referrer_id FROM public.profiles WHERE id = NEW.user_id;
        
        IF v_referrer_id IS NOT NULL THEN
            -- 1. Credit 5 GHS to referrer
            UPDATE public.profiles
            SET balance = balance + 5.00,
                total_earnings = total_earnings + 5.00,
                total_referrals = total_referrals + 1
            WHERE id = v_referrer_id;

            -- 2. Record commission transaction for referrer
            INSERT INTO public.transactions (user_id, amount, type, status, description)
            VALUES (v_referrer_id, 5.00, 'commission', 'success', 'Referral commission for affiliate activation');
        END IF;

    END IF;

    -- PART B: Track Bundle Purchases & 2% Referral Commission
    IF NEW.type = 'purchase' AND NEW.status = 'success' THEN
        -- 1. Update user's own stats
        UPDATE public.profiles
        SET total_orders = total_orders + 1,
            total_sales = total_sales + NEW.amount
        WHERE id = NEW.user_id;

        -- 2. Handle 2% commission for referrer if they exist
        SELECT referred_by INTO v_referrer_id FROM public.profiles WHERE id = NEW.user_id;
        
        IF v_referrer_id IS NOT NULL THEN
            UPDATE public.profiles
            SET balance = balance + (NEW.amount * 0.02),
                total_earnings = total_earnings + (NEW.amount * 0.02)
            WHERE id = v_referrer_id;

            INSERT INTO public.transactions (user_id, amount, type, status, description)
            VALUES (
                v_referrer_id, 
                (NEW.amount * 0.02), 
                'commission', 
                'success', 
                '2% Purchase commission from referral purchase'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On transaction update/insert
DROP TRIGGER IF EXISTS on_transaction_processed ON public.transactions;
CREATE TRIGGER on_transaction_processed
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_affiliate_activation();

-- 6. Create DATA_PACKAGES table
DROP TABLE IF EXISTS public.data_packages;
CREATE TABLE public.data_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network TEXT NOT NULL,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    validity TEXT DEFAULT '30 Days',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(network, size)
);

-- 7. Insert Data Packages
-- Use ON CONFLICT to update prices if they change
INSERT INTO public.data_packages (network, name, size, price)
VALUES
-- Telecel BUSINESS
('telecel', '5GB Package', '5GB', 24.00),
('telecel', '10GB Package', '10GB', 47.00),
('telecel', '15GB Package', '15GB', 65.00),
('telecel', '20GB Package', '20GB', 86.00),
('telecel', '25GB Package', '25GB', 102.00),
('telecel', '30GB Package', '30GB', 119.00),
('telecel', '40GB Package', '40GB', 156.00),
('telecel', '50GB Package', '50GB', 201.00),
('telecel', '100GB Package', '100GB', 389.00),

-- MTN UP2U BUSINESS
('mtn-up2u', '1GB UP2U', '1GB', 6.00),
('mtn-up2u', '2GB UP2U', '2GB', 11.00),
('mtn-up2u', '3GB UP2U', '3GB', 16.00),
('mtn-up2u', '4GB UP2U', '4GB', 21.00),
('mtn-up2u', '5GB UP2U', '5GB', 26.00),
('mtn-up2u', '6GB UP2U', '6GB', 30.00),
('mtn-up2u', '7GB UP2U', '7GB', 36.00),
('mtn-up2u', '8GB UP2U', '8GB', 41.00),
('mtn-up2u', '10GB UP2U', '10GB', 47.00),
('mtn-up2u', '12GB UP2U', '12GB', 54.00),
('mtn-up2u', '15GB UP2U', '15GB', 67.00),
('mtn-up2u', '20GB UP2U', '20GB', 89.00),
('mtn-up2u', '25GB UP2U', '25GB', 110.00),
('mtn-up2u', '30GB UP2U', '30GB', 129.00),
('mtn-up2u', '40GB UP2U', '40GB', 170.00),
('mtn-up2u', '50GB UP2U', '50GB', 208.00),

-- AT ISHARE BUSINESS
('at-ishare', '1GB iShare', '1GB', 5.00),
('at-ishare', '3GB iShare', '3GB', 14.00),
('at-ishare', '4GB iShare', '4GB', 19.00),
('at-ishare', '5GB iShare', '5GB', 23.00),
('at-ishare', '6GB iShare', '6GB', 26.00),
('at-ishare', '8GB iShare', '8GB', 36.00),
('at-ishare', '10GB iShare', '10GB', 43.00),

-- AT BIG TIME BUSINESS
('at-bigtime', '15GB Big Time', '15GB', 56.00),
('at-bigtime', '20GB Big Time', '20GB', 70.00),
('at-bigtime', '30GB Big Time', '30GB', 85.00),
('at-bigtime', '40GB Big Time', '40GB', 95.00),
('at-bigtime', '50GB Big Time', '50GB', 100.00),
('at-bigtime', '80GB Big Time', '80GB', 170.00),
('at-bigtime', '100GB Big Time', '100GB', 201.00)
ON CONFLICT (network, size) DO UPDATE 
SET price = EXCLUDED.price,
    name = EXCLUDED.name,
    is_active = TRUE;

-- Enable RLS for data_packages
ALTER TABLE public.data_packages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active data packages
DROP POLICY IF EXISTS "Anyone can view active data packages" ON public.data_packages;
CREATE POLICY "Anyone can view active data packages" ON public.data_packages
    FOR SELECT USING (is_active = TRUE);
