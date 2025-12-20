import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Layout, Lock, Mail, AlertCircle } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
            });
            navigate("/dashboard");
        } catch (error: any) {
            console.error('Login error:', error);

            let errorMessage = error.message;
            if (errorMessage === 'Failed to fetch' || errorMessage.includes('URL')) {
                errorMessage = "Database connection failed. Please ensure your Supabase URL and Anon Key are correctly set in the .env file.";
            }

            toast({
                title: "Login failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Migration Notice */}
                <div className="mb-6 bg-accent/10 border border-accent/20 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Migration Notice</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Due to our new Affiliate Program, users from the old system are required to <Link to="/signup" className="text-primary font-bold hover:underline">sign up again</Link> to continue.
                        </p>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Layout className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-elevated">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 bg-background/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-background/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary font-semibold hover:underline">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
