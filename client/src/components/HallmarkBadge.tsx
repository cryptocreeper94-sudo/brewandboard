import { useState } from "react";
import QRCode from "react-qr-code";
import { Shield, CheckCircle, XCircle, Clock, ExternalLink, Coffee } from "lucide-react";

interface HallmarkBadgeProps {
  serialNumber: string;
  assetName?: string;
  issuedAt?: string;
  status?: string;
  solanaTx?: string;
  showQR?: boolean;
  size?: "sm" | "md" | "lg";
  isCompany?: boolean;
  avatarUrl?: string;
}

export function HallmarkBadge({ 
  serialNumber, 
  assetName,
  issuedAt,
  status = "active",
  solanaTx,
  showQR = true,
  size = "md",
  isCompany = false,
  avatarUrl
}: HallmarkBadgeProps) {
  const verifyUrl = `${window.location.origin}/verify/${serialNumber}`;
  const solanaExplorerUrl = solanaTx ? `https://solscan.io/tx/${solanaTx}` : null;
  
  const sizeClasses = {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  };
  
  const qrSizes = { sm: 80, md: 120, lg: 160 };
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const statusColors: Record<string, string> = {
    active: "border-emerald-600/50 bg-gradient-to-br from-emerald-950/40 to-emerald-900/20",
    pending: "border-amber-600/50 bg-gradient-to-br from-amber-950/40 to-amber-900/20",
    revoked: "border-red-600/50 bg-gradient-to-br from-red-950/40 to-red-900/20",
  };
  
  const StatusIcon = status === "active" ? CheckCircle : status === "revoked" ? XCircle : Clock;
  const statusColor = status === "active" ? "text-emerald-400" : status === "revoked" ? "text-red-400" : "text-amber-400";
  
  return (
    <div 
      className={`rounded-xl border-2 ${statusColors[status] || statusColors.active} ${sizeClasses[size]} backdrop-blur-sm`}
      data-testid={`hallmark-badge-${serialNumber}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          {isCompany ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
          ) : avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="User avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-600/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate-300" />
            </div>
          )}
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-white ${textSizes[size]}`}>
              {isCompany ? "BREW & BOARD VERIFIED" : "VERIFIED HALLMARK"}
            </span>
          </div>
          
          <div className={`font-mono text-amber-400 mb-2 ${textSizes[size]}`}>
            {serialNumber}
          </div>
          
          {assetName && (
            <div className={`text-slate-300 mb-1 ${textSizes[size]}`}>{assetName}</div>
          )}
          
          {issuedAt && (
            <div className="text-slate-500 text-xs">
              Issued: {new Date(issuedAt).toLocaleDateString()}
            </div>
          )}
          
          {solanaTx && (
            <a 
              href={solanaExplorerUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2 transition-colors"
              data-testid="link-solana-explorer"
            >
              <span>View on Solana</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        
        {showQR && (
          <div className="flex-shrink-0 relative">
            <div className="bg-white p-2 rounded-lg shadow-lg">
              <QRCode value={verifyUrl} size={qrSizes[size]} level="M" />
            </div>
            {isCompany && (
              <div className="absolute -bottom-2 -left-4 w-10 h-10">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg border-2 border-white transform rotate-12">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
        <span className="text-xs text-slate-500">
          Scan QR or visit: <span className="text-amber-500/80 break-all">{verifyUrl}</span>
        </span>
      </div>
    </div>
  );
}

export function CompactHallmarkBadge({ 
  serialNumber, 
  status = "active",
  solanaTx
}: { serialNumber: string; status?: string; solanaTx?: string }) {
  const StatusIcon = status === "active" ? CheckCircle : status === "revoked" ? XCircle : Clock;
  const statusColor = status === "active" ? "text-emerald-400" : status === "revoked" ? "text-red-400" : "text-amber-400";
  
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700"
      data-testid={`compact-hallmark-${serialNumber}`}
    >
      <Shield className="w-4 h-4 text-amber-500" />
      <span className="font-mono text-xs text-amber-400">{serialNumber}</span>
      <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
      {solanaTx && (
        <a 
          href={`https://solscan.io/tx/${solanaTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
