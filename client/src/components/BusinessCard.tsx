import { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Coffee, Mail, Phone, Globe, MapPin, Download, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";

interface BusinessCardProps {
  name: string;
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  hallmarkCode?: string;
  avatarUrl?: string;
  variant?: "light" | "dark" | "premium";
}

export function BusinessCard({
  name,
  title,
  company = "Brew & Board Coffee",
  email,
  phone,
  website = "brewandboard.coffee",
  location = "Nashville, TN",
  hallmarkCode,
  avatarUrl,
  variant = "premium",
}: BusinessCardProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadAsPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [3.5, 2]
      });
      
      pdf.setFillColor(17, 24, 39);
      pdf.rect(0, 0, 3.5, 2, 'F');
      
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 0, 0.1, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(name, 0.25, 0.45);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(156, 163, 175);
      pdf.text(title, 0.25, 0.65);
      
      pdf.setFontSize(10);
      pdf.setTextColor(245, 158, 11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(company, 0.25, 0.9);
      
      let yPos = 1.15;
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      
      if (email) {
        pdf.text(email, 0.25, yPos);
        yPos += 0.15;
      }
      if (phone) {
        pdf.text(phone, 0.25, yPos);
        yPos += 0.15;
      }
      if (website) {
        pdf.text(website, 0.25, yPos);
        yPos += 0.15;
      }
      if (location) {
        pdf.text(location, 0.25, yPos);
      }
      
      if (hallmarkCode) {
        pdf.setTextColor(16, 185, 129);
        pdf.setFontSize(6);
        pdf.text(`Verified: ${hallmarkCode}`, 0.25, 1.8);
      }
      
      pdf.save(`${name.replace(/\s+/g, '_')}_business_card.pdf`);
      toast({ title: "PDF Downloaded", description: "Business card saved as PDF" });
    } catch (error) {
      toast({ title: "Download Failed", variant: "destructive" });
    }
  };

  const shareCard = async () => {
    const shareData = {
      title: `${name} - ${title}`,
      text: `${name}, ${title} at ${company}. ${email ? `Email: ${email}` : ''}`,
      url: website ? `https://${website}` : undefined,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${name}\n${title}\n${company}\n${email || ''}\n${phone || ''}\n${website || ''}`
        );
        toast({ title: "Copied to clipboard", description: "Business card info copied" });
      }
    } catch (error) {
      toast({ title: "Share failed", variant: "destructive" });
    }
  };

  const cardStyles = {
    light: "bg-white text-gray-900 border-gray-200",
    dark: "bg-gray-900 text-white border-gray-800",
    premium: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-amber-500/30",
  };

  return (
    <div className="space-y-4">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full max-w-[400px] aspect-[1.75] rounded-2xl border-2 shadow-2xl overflow-hidden ${cardStyles[variant]}`}
        data-testid="business-card"
      >
        {/* Premium gradient accent */}
        {variant === "premium" && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600" />
        )}
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-32 h-32 border border-current rounded-full" />
          <div className="absolute bottom-4 right-8 w-24 h-24 border border-current rounded-full" />
        </div>

        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Coffee className="h-7 w-7 text-white" />
                </div>
              )}
              <div>
                <h2 className="font-serif text-lg font-bold tracking-tight">{name}</h2>
                <p className="text-sm text-gray-400">{title}</p>
              </div>
            </div>
            
            {/* QR Code */}
            {(hallmarkCode || website) && (
              <div className="bg-white p-1.5 rounded-lg">
                <QRCode
                  value={hallmarkCode ? `${window.location.origin}/verify/${hallmarkCode}` : `https://${website}`}
                  size={48}
                  level="L"
                />
              </div>
            )}
          </div>

          {/* Company */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-amber-500 font-serif font-bold text-base">{company}</span>
            {hallmarkCode && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                <Shield className="h-2.5 w-2.5 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-auto grid grid-cols-2 gap-2 text-[11px]">
            {email && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Mail className="h-3 w-3 text-amber-500/70" />
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Phone className="h-3 w-3 text-amber-500/70" />
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Globe className="h-3 w-3 text-amber-500/70" />
                <span>{website}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin className="h-3 w-3 text-amber-500/70" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Hallmark Footer */}
          {hallmarkCode && (
            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] text-emerald-500/80">
              <Shield className="h-2.5 w-2.5" />
              <code className="font-mono">{hallmarkCode}</code>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-2 max-w-[400px]">
        <Button
          onClick={downloadAsPDF}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          data-testid="button-download-card"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={shareCard}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          data-testid="button-share-card"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        {hallmarkCode && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(`/verify/${hallmarkCode}`, '_blank')}
            data-testid="button-verify-card"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function BusinessCardPreview() {
  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  return (
    <BusinessCard
      name={user?.businessName || "Your Name"}
      title={user?.contactName || "Business Owner"}
      email={user?.email || "hello@brewandboard.coffee"}
      phone="(615) 555-0123"
      hallmarkCode={user?.hallmarkPrefix || undefined}
    />
  );
}
