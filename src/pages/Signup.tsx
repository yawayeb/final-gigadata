import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Layout, Lock, Mail, User, UserPlus } from "lucide-react";
import { SystemNoticeBanner } from "@/components/SystemNoticeBanner";
import { PublicNav } from "@/components/layout/PublicNav";
import { triggerEmail } from "@/lib/email";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up the user
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        referred_by: referralCode ? await getReferrerId(referralCode) : null,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // 2. Trigger Welcome Email
            await triggerEmail({
                type: 'signup',
                email,
                name: fullName
            });

            toast({
                title: "Account created!",
                description: "Check your email for the confirmation link.",
            });
            navigate("/login");
        } catch (error: any) {
            console.error('Signup error:', error);

            let errorMessage = error.message;
            if (errorMessage === 'Failed to fetch' || errorMessage.includes('URL')) {
                errorMessage = "Database connection failed. Please ensure your Supabase URL and Anon Key are correctly set in the .env file.";
            }

            toast({
                title: "Sign up failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getReferrerId = async (code: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', code.trim())
            .single();

        if (error || !data) {
            console.warn("Invalid referral code");
            return null;
        }
        return data.id;
    };

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            <SystemNoticeBanner />
            <PublicNav />
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/15 rounded-full blur-[100px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent/15 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

                <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Layout className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Create Account</h1>
                    <p className="text-muted-foreground mt-2">Join our community and start earning today</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-elevated">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-10 h-11 bg-background/50"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-11 bg-background/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-background/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-2">
                            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="referralCode"
                                    type="text"
                                    placeholder="EDUHUB-XXXXXX"
                                    className="pl-10 h-11 bg-background/50"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient"
                            size="xl"
                            className="w-full font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <p className="text-center mt-6 text-muted-foreground text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
