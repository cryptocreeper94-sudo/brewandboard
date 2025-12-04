import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Shield, CheckCircle, XCircle, Clock, ExternalLink, Coffee, ArrowLeft, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";

interface VerificationResult {
  valid: boolean;
  hallmark?: {
    id: string;
    serialNumber: string;
    prefix: string;
    assetType: string;
    assetName?: string;
    issuedAt: string;
    status: string;
    isCompanyHallmark: boolean;
    verificationCount: number;
    solanaTxSignature?: string;
    metadata?: Record<string, any>;
  };
  blockchain?: {
    exists: boolean;
    confirmed: boolean;
    slot?: number;
    blockTime?: string;
  };
  message: string;
}

export default function VerifyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function verify() {
      if (!code) {
        setError("No hallmark code provided");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/hallmark/verify/${code}`);
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError("Failed to verify hallmark. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    verify();
  }, [code]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705] flex items-center justify-center">
        <div className="text-center" data-testid="loading-verification">
          <div className="relative">
            <Shield className="w-20 h-20 text-amber-600 mx-auto mb-4" />
            <Loader2 className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-amber-200/80 text-lg">Verifying hallmark...</p>
          <p className="text-slate-500 text-sm mt-2">Checking blockchain records</p>
        </div>
      </div>
    );
  }
  
  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705] flex items-center justify-center p-4">
        <div 
          className="bg-red-950/30 border-2 border-red-600/50 rounded-2xl p-8 text-center max-w-md w-full backdrop-blur-sm"
          data-testid="verification-error"
        >
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2 font-serif">Verification Failed</h1>
          <p className="text-red-300 mb-6">{error || "Unable to verify this hallmark"}</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Return to Brew & Board
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  const { valid, hallmark, blockchain, message } = result;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705] flex items-center justify-center p-4">
      <div 
        className={`max-w-lg w-full rounded-2xl border-2 ${
          valid 
            ? 'border-emerald-600/50 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10' 
            : 'border-red-600/50 bg-gradient-to-br from-red-950/30 to-red-900/10'
        } p-8 backdrop-blur-sm`}
        data-testid="verification-result"
      >
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {valid ? (
              <CheckCircle className="w-24 h-24 text-emerald-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-24 h-24 text-red-400 mx-auto mb-4" />
            )}
            {hallmark?.isCompanyHallmark && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg border-2 border-white">
                <Coffee className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 font-serif tracking-wide">
            {valid ? "VERIFIED" : "INVALID"}
          </h1>
          <p className={`text-lg ${valid ? "text-emerald-300" : "text-red-300"}`}>
            {message}
          </p>
        </div>
        
        {hallmark && (
          <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Serial Number</label>
                <div className="font-mono text-xl text-amber-400 mt-1" data-testid="text-serial-number">
                  {hallmark.serialNumber}
                </div>
              </div>
              
              {hallmark.assetName && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Document</label>
                  <div className="text-white mt-1">{hallmark.assetName}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Type</label>
                  <div className="text-white mt-1 capitalize">
                    {hallmark.assetType.replace(/_/g, ' ')}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Status</label>
                  <div className={`mt-1 capitalize font-medium ${
                    hallmark.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {hallmark.status}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Issued</label>
                  <div className="text-white mt-1">
                    {new Date(hallmark.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Verifications</label>
                  <div className="text-white mt-1">{hallmark.verificationCount} times</div>
                </div>
              </div>
              
              {hallmark.isCompanyHallmark && (
                <div className="mt-2 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Coffee className="w-4 h-4" />
                    <span className="text-sm font-medium">Official Brew & Board Hallmark</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {blockchain && (
          <div className="bg-purple-950/30 border border-purple-600/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-white">Blockchain Verification</span>
            </div>
            
            {blockchain.confirmed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmed on Solana Blockchain</span>
                </div>
                {blockchain.slot && (
                  <div className="text-xs text-slate-400">
                    Block Slot: {blockchain.slot.toLocaleString()}
                  </div>
                )}
                {hallmark?.solanaTxSignature && (
                  <a
                    href={`https://solscan.io/tx/${hallmark.solanaTxSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
                    data-testid="link-blockchain-tx"
                  >
                    View Transaction on Solscan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Pending blockchain confirmation</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <QRCode value={`${window.location.origin}/verify/${code}`} size={120} level="M" />
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-700/50 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Coffee className="w-5 h-5" />
            <span className="font-serif text-lg">Brew & Board Coffee</span>
          </div>
          <p className="text-xs text-slate-500">
            Blockchain-verified authenticity powered by Solana
          </p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Visit Brew & Board
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
