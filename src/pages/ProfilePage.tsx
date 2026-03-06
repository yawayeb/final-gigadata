import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Calendar } from "lucide-react";
import { format } from "date-fns";

const ProfilePage = () => {
    const { toast } = useToast();
    const { profile } = useProfile();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            toast({
                title: "Signed out successfully",
                description: "See you soon!",
            });
            navigate("/");
        } catch (error: any) {
            toast({
                title: "Sign out failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                    My Profile
                </h1>
                <p className="text-muted-foreground">
                    Manage your account information
                </p>
            </div>

            <div className="bg-card rounded-2xl shadow-card p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-foreground">
                            {profile?.full_name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {profile?.is_affiliate ? "Affiliate Partner" : "Member"}
                        </p>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{profile?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Member Since</p>
                            <p className="font-medium text-foreground">
                                {profile?.created_at ? format(new Date(profile.created_at), 'MMMM dd, yyyy') : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {profile?.is_affiliate && profile?.referral_code && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Referral Code</p>
                                <p className="font-mono font-bold text-primary">{profile.referral_code}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sign Out Button */}
                <Button
                    variant="destructive"
                    size="xl"
                    className="w-full"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default ProfilePage;
