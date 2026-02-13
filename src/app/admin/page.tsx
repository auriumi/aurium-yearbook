"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- Needed for routing
import Image from "next/image";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import * as loginService from "@/app/auth/login/loginService";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await loginService.handleLogin(email, password, true);

    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      console.log(res.message);
      setIsLoading(false);
    }
    //TODO: "Update Password" screen
    //setIsPasswordUpdateRequired(true); setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <Card className="w-full max-w-md border-stone-800 bg-stone-900/50 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center items-center gap-3 mb-6">
             <div className="relative w-10 h-10">
                <Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" />
             </div>
             <div className="h-8 w-[1px] bg-stone-700"></div>
             <div className="relative w-10 h-10">
                <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
             </div>
          </div>
          <CardTitle className="text-2xl font-serif text-white tracking-wide">Admin Portal</CardTitle>
          <CardDescription className="text-stone-400">Secure access for yearbook administrators</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-stone-500" />
                    <Input 
                        name="email" 
                        type="email" 
                        placeholder="admin@aurium.edu.ph" 
                        className="pl-10 bg-stone-950/50 border-stone-800 text-stone-200 focus:border-amber-700 focus:ring-amber-900/20 h-11" 
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-stone-500" />
                    <Input 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-stone-950/50 border-stone-800 text-stone-200 focus:border-amber-700 focus:ring-amber-900/20 h-11" 
                        required
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading}
                onClick={() => handleLogin}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold h-11 shadow-lg shadow-amber-900/20 mt-4 transition-all"
            >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
                ) : (
                    <><ArrowRight className="mr-2 h-4 w-4" /> Access Dashboard</>
                )}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="justify-center pb-8">
            <p className="text-xs text-stone-600">Restricted Area. Authorized Personnel Only.</p>
        </CardFooter>
      </Card>
    </div>
  );
}