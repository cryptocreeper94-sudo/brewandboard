import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Briefcase,
  Map,
  TrendingUp,
  FileCheck,
  Loader2,
  Shield,
  Coffee,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface DocumentSection {
  title: string;
  content: string;
}

type DocumentType = "business_plan" | "roadmap" | "executive_summary" | "proposal";

const DOCUMENT_TEMPLATES: Record<DocumentType, { title: string; sections: string[]; icon: any; color: string }> = {
  business_plan: {
    title: "Business Plan",
    sections: ["Executive Summary", "Market Analysis", "Products & Services", "Marketing Strategy", "Financial Projections", "Team & Operations"],
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600"
  },
  roadmap: {
    title: "Product Roadmap",
    sections: ["Vision & Goals", "Q1 Milestones", "Q2 Milestones", "Q3 Milestones", "Q4 Milestones", "Key Dependencies"],
    icon: Map,
    color: "from-purple-500 to-pink-600"
  },
  executive_summary: {
    title: "Executive Summary",
    sections: ["Company Overview", "Problem Statement", "Solution", "Market Opportunity", "Business Model", "Key Metrics"],
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600"
  },
  proposal: {
    title: "Business Proposal",
    sections: ["Introduction", "Project Scope", "Timeline & Deliverables", "Investment Required", "Expected ROI", "Next Steps"],
    icon: FileCheck,
    color: "from-amber-500 to-orange-600"
  }
};

interface DocumentExportProps {
  hallmarkCode?: string;
  companyName?: string;
}

export function DocumentExport({ hallmarkCode, companyName = "Brew & Board Coffee" }: DocumentExportProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("business_plan");
  const [documentTitle, setDocumentTitle] = useState("");
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initializeSections = (type: DocumentType) => {
    const template = DOCUMENT_TEMPLATES[type];
    setSections(template.sections.map(s => ({ title: s, content: "" })));
    setDocumentTitle(template.title);
  };

  const handleTypeChange = (type: DocumentType) => {
    setSelectedType(type);
    initializeSections(type);
  };

  const updateSection = (index: number, content: string) => {
    const updated = [...sections];
    updated[index].content = content;
    setSections(updated);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      pdf.setFillColor(17, 24, 39);
      pdf.rect(0, 0, pageWidth, 100, 'F');

      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 96, pageWidth, 4, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(documentTitle || DOCUMENT_TEMPLATES[selectedType].title, margin, 55);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(companyName, margin, 75);
      pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin - 100, 75);

      yPos = 130;

      pdf.setTextColor(17, 24, 39);

      for (const section of sections) {
        if (!section.content.trim()) continue;

        if (yPos > pageHeight - 100) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 158, 11);
        pdf.text(section.title, margin, yPos);
        yPos += 20;

        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin, yPos - 2, 40, 2, 'F');
        yPos += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);

        const lines = pdf.splitTextToSize(section.content, contentWidth);
        for (const line of lines) {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += 14;
        }

        yPos += 20;
      }

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        pdf.setFillColor(250, 250, 250);
        pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
        pdf.setDrawColor(230, 230, 230);
        pdf.line(0, pageHeight - 40, pageWidth, pageHeight - 40);
        
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        
        if (hallmarkCode) {
          pdf.setTextColor(16, 185, 129);
          pdf.text(`Verified: ${hallmarkCode}`, margin, pageHeight - 15);
        }
        
        pdf.setTextColor(150, 150, 150);
        pdf.text(companyName, pageWidth - margin, pageHeight - 15, { align: 'right' });
      }

      const filename = `${documentTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({ 
        title: "PDF Generated", 
        description: `${documentTitle} has been downloaded.` 
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({ 
        title: "Generation Failed", 
        description: "Failed to create PDF document.",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => initializeSections(selectedType)}
          data-testid="button-export-document"
        >
          <FileText className="h-4 w-4" />
          Export Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Export Professional Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={selectedType} onValueChange={(v) => handleTypeChange(v as DocumentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TEMPLATES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <template.icon className="h-4 w-4" />
                      {template.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Document Title</Label>
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter document title..."
              data-testid="input-document-title"
            />
          </div>

          <div className="space-y-4">
            <Label>Sections</Label>
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${DOCUMENT_TEMPLATES[selectedType].color}`} />
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, e.target.value)}
                  placeholder={`Enter content for ${section.title}...`}
                  className="min-h-[80px]"
                  data-testid={`textarea-section-${index}`}
                />
              </div>
            ))}
          </div>

          {hallmarkCode && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">
                Document will be verified with hallmark: <code className="font-mono">{hallmarkCode}</code>
              </span>
            </div>
          )}

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            data-testid="button-generate-pdf"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentExportPanel({ hallmarkCode }: { hallmarkCode?: string }) {
  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 font-serif text-xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Professional Documents
        </CardTitle>
        <CardDescription>
          Generate blockchain-verified business documents
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(DOCUMENT_TEMPLATES).map(([key, template]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-white/50 border border-gray-100 text-center cursor-pointer hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                <template.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-medium">{template.title}</p>
            </motion.div>
          ))}
        </div>
        
        <DocumentExport hallmarkCode={hallmarkCode} />
      </CardContent>
    </Card>
  );
}
