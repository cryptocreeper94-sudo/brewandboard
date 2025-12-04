import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { Shield, CheckCircle, Coffee, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HallmarkBadge } from "@/components/HallmarkBadge";

export default function HallmarkSuccessPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get('session_id');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function completeHallmarkMint() {
      const userStr = localStorage.getItem('coffee_user');
      if (!userStr) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      
      try {
        const response = await fetch('/api/hallmark/mint/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        }
        
        const profileResponse = await fetch(`/api/hallmark/profile/${user.id}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error completing hallmark mint:', error);
      } finally {
        setLoading(false);
      }
    }
    
    completeHallmarkMint();
  }, [sessionId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-amber-200/80">Setting up your hallmark...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white font-serif mb-3" data-testid="text-success-title">
          Hallmark Minted!
        </h1>
        
        <p className="text-lg text-emerald-300 mb-8">
          Your personal blockchain-verified hallmark is now active
        </p>
        
        {profile && (
          <div className="mb-8">
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Hallmark Prefix</p>
                  <p className="text-xl font-mono text-amber-400" data-testid="text-hallmark-prefix">
                    {profile.hallmarkPrefix}
                  </p>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm">
                Your documents will be stamped with serial numbers like:
              </p>
              <p className="font-mono text-amber-400/80 text-sm mt-1">
                {profile.hallmarkPrefix}-000001, {profile.hallmarkPrefix}-000002, ...
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">What You Can Do Now</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm">
                Stamp your portfolio documents with blockchain verification
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm">
                Generate PDFs with your personal QR code and hallmark
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm">
                Share verified documents that anyone can authenticate
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm">
                Upload a custom avatar for your hallmark badge
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/portfolio">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full sm:w-auto" data-testid="button-go-portfolio">
              Go to Portfolio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/blockchain-tutorial">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2 w-full sm:w-auto" data-testid="button-learn-more">
              Learn How It Works
            </Button>
          </Link>
        </div>
        
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
            <Coffee className="w-5 h-5" />
            <span className="font-serif text-lg">Brew & Board Coffee</span>
          </div>
          <p className="text-xs text-slate-500">
            Blockchain-verified authenticity powered by Solana
          </p>
        </div>
      </div>
    </div>
  );
}
