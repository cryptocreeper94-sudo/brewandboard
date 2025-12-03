import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  FileText, 
  Download, 
  Share2, 
  Trash2, 
  Plus,
  ChevronLeft,
  Scan,
  Loader2,
  Check,
  X,
  Home,
  Eye,
  FileImage,
  Sparkles
} from "lucide-react";
import { createWorker, Worker } from "tesseract.js";
import { jsPDF } from "jspdf";

interface ScannedPage {
  id: string;
  imageData: string;
  extractedText: string;
  isProcessing: boolean;
  ocrProgress: number;
}

export default function ScanPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [documentName, setDocumentName] = useState("Scanned Document");
  const [showCamera, setShowCamera] = useState(false);
  
  const ocrWorkerRef = useRef<Worker | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [location] = useLocation();

  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initWorker = async () => {
      try {
        const worker = await createWorker("eng", 1, {
          logger: (m) => {
            if (m.status === "recognizing text" && mounted) {
              const progress = Math.round(m.progress * 100);
              setPages(prev => prev.map(p => 
                p.isProcessing ? { ...p, ocrProgress: progress } : p
              ));
            }
          }
        });
        if (mounted) {
          ocrWorkerRef.current = worker;
          setIsWorkerReady(true);
        } else {
          worker.terminate();
        }
      } catch (error) {
        console.error("Failed to initialize OCR worker:", error);
        if (mounted) {
          toast({
            title: "OCR Initialization Error",
            description: "Text recognition may not work. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    };
    
    initWorker();
    
    return () => {
      mounted = false;
      if (ocrWorkerRef.current) {
        ocrWorkerRef.current.terminate();
        ocrWorkerRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [toast]);

  useEffect(() => {
    stopCameraStream();
  }, [location, stopCameraStream]);

  const processImage = async (imageData: string) => {
    const pageId = `page-${Date.now()}`;
    
    setPages(prev => [...prev, {
      id: pageId,
      imageData,
      extractedText: "",
      isProcessing: true,
      ocrProgress: 0
    }]);

    if (ocrWorkerRef.current && isWorkerReady) {
      try {
        const result = await ocrWorkerRef.current.recognize(imageData);
        setPages(prev => prev.map(p => 
          p.id === pageId 
            ? { ...p, extractedText: result.data.text, isProcessing: false, ocrProgress: 100 }
            : p
        ));
        toast({
          title: "Page Scanned",
          description: "Text extracted successfully!"
        });
      } catch (error) {
        console.error("OCR failed:", error);
        setPages(prev => prev.map(p => 
          p.id === pageId 
            ? { ...p, isProcessing: false, ocrProgress: 0 }
            : p
        ));
        toast({
          title: "OCR Failed",
          description: "Could not extract text from this image.",
          variant: "destructive"
        });
      }
    } else {
      setPages(prev => prev.map(p => 
        p.id === pageId 
          ? { ...p, isProcessing: false }
          : p
      ));
      toast({
        title: "OCR Not Ready",
        description: "Text recognition is still loading. Image saved without OCR.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive"
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      processImage(imageData);
    };
    reader.readAsDataURL(file);

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      cameraStreamRef.current = stream;
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access or use the file upload option.",
        variant: "destructive"
      });
    }
  };

  const captureFromLiveCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      processImage(imageData);
      stopCameraStream();
    }
  };

  const retryOcr = async (pageId: string, imageData: string) => {
    if (!ocrWorkerRef.current || !isWorkerReady) {
      toast({
        title: "OCR Not Ready",
        description: "Text recognition is still loading. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, isProcessing: true, ocrProgress: 0 } : p
    ));

    try {
      const result = await ocrWorkerRef.current.recognize(imageData);
      setPages(prev => prev.map(p => 
        p.id === pageId 
          ? { ...p, extractedText: result.data.text, isProcessing: false, ocrProgress: 100 }
          : p
      ));
      toast({
        title: "OCR Complete",
        description: "Text extracted successfully!"
      });
    } catch (error) {
      console.error("OCR retry failed:", error);
      setPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, isProcessing: false, ocrProgress: 0 } : p
      ));
      toast({
        title: "OCR Failed",
        description: "Could not extract text. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removePage = (index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index));
    if (selectedPageIndex === index) {
      setSelectedPageIndex(null);
    } else if (selectedPageIndex !== null && selectedPageIndex > index) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  const generatePdfBlob = async (): Promise<Blob> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 4;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const page = pages[i];
      
      const img = new Image();
      img.src = page.imageData;
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const imgRatio = img.width / img.height;
          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = (pageHeight * 0.55) - margin;
          
          let width = maxWidth;
          let height = width / imgRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * imgRatio;
          }
          
          const x = (pageWidth - width) / 2;
          const y = margin;
          
          pdf.addImage(page.imageData, "JPEG", x, y, width, height);
          
          if (page.extractedText && page.extractedText.trim()) {
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            
            let textY = y + height + 8;
            const textLines = pdf.splitTextToSize(page.extractedText, maxWidth);
            
            for (const line of textLines) {
              if (textY + lineHeight > pageHeight - margin) {
                pdf.addPage();
                textY = margin;
              }
              pdf.text(line, margin, textY);
              textY += lineHeight;
            }
          }
          
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    return pdf.output("blob");
  };

  const generatePdf = async () => {
    if (pages.length === 0) {
      toast({
        title: "No Pages",
        description: "Please scan at least one document first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const pdfBlob = await generatePdfBlob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (navigator.share && /mobile/i.test(navigator.userAgent)) {
        try {
          const file = new File([pdfBlob], `${documentName}.pdf`, { type: "application/pdf" });
          await navigator.share({
            files: [file],
            title: documentName,
            text: "Scanned document from Coffee Talk"
          });
          toast({
            title: "Shared Successfully",
            description: "Your document has been shared!"
          });
        } catch (shareError) {
          downloadPdf(pdfUrl);
        }
      } else {
        downloadPdf(pdfUrl);
      }

      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not create PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadPdf = (pdfUrl: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${documentName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "PDF Downloaded",
      description: "Your document has been saved!"
    });
  };

  const sharePdf = async () => {
    if (pages.length === 0) {
      toast({
        title: "No Pages",
        description: "Please scan at least one document first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const pdfBlob = await generatePdfBlob();

      if (navigator.share) {
        const file = new File([pdfBlob], `${documentName}.pdf`, { type: "application/pdf" });
        await navigator.share({
          files: [file],
          title: documentName,
          text: "Scanned document from Coffee Talk"
        });
        toast({
          title: "Shared Successfully",
          description: "Your document has been shared!"
        });
      } else {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        downloadPdf(pdfUrl);
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Share Failed",
        description: "Could not share document. Downloaded instead.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        data-testid="input-file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        data-testid="input-camera-capture"
      />
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
              </div>
            </div>
            <div className="p-6 bg-black/80 flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={stopCameraStream}
                className="text-white h-14 w-14"
                data-testid="button-stop-camera"
              >
                <X className="h-8 w-8" />
              </Button>
              <Button
                size="icon"
                onClick={captureFromLiveCamera}
                className="h-20 w-20 rounded-full bg-white hover:bg-gray-200"
                data-testid="button-capture-photo"
              >
                <Camera className="h-10 w-10 text-black" />
              </Button>
              <div className="w-14" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                <Scan className="h-8 w-8 text-primary" />
                Document Scanner
              </h1>
              <p className="text-muted-foreground">Scan documents and create PDFs instantly</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2" data-testid="button-home">
              <Home className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </header>

        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-amber-800 font-medium text-sm">On-Device Processing</p>
              <p className="text-amber-700 text-sm">Your documents are processed privately on your device - nothing leaves your phone.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Add Document Pages</h2>
                    <p className="text-muted-foreground">Take a photo or upload images of your documents</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      className="gap-2 bg-primary hover:bg-primary/90"
                      data-testid="button-camera-scan"
                    >
                      <Camera className="h-4 w-4" />
                      Scan with Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                      data-testid="button-upload-file"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={startLiveCamera}
                      className="gap-2"
                      data-testid="button-live-camera"
                    >
                      <Eye className="h-4 w-4" />
                      Live Camera
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {pages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileImage className="h-5 w-5" />
                        Scanned Pages ({pages.length})
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        className="gap-2"
                        data-testid="button-add-page"
                      >
                        <Plus className="h-4 w-4" /> Add Page
                      </Button>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {pages.map((page, index) => (
                          <motion.div
                            key={page.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              selectedPageIndex === index 
                                ? "border-primary shadow-lg" 
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedPageIndex(index)}
                            data-testid={`page-thumbnail-${index}`}
                          >
                            <img
                              src={page.imageData}
                              alt={`Page ${index + 1}`}
                              className="w-full aspect-[3/4] object-cover"
                            />
                            
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs">
                                {index + 1}
                              </Badge>
                            </div>

                            {page.isProcessing && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
                                <p className="text-white text-xs mb-2">Extracting text...</p>
                                <Progress value={page.ocrProgress} className="w-full h-1" />
                              </div>
                            )}

                            {!page.isProcessing && page.extractedText && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-green-500 text-white text-xs gap-1">
                                  <Check className="h-3 w-3" /> OCR
                                </Badge>
                              </div>
                            )}

                            {!page.isProcessing && !page.extractedText && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-2 left-2 h-6 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  retryOcr(page.id, page.imageData);
                                }}
                                data-testid={`button-retry-ocr-${index}`}
                              >
                                <Scan className="h-3 w-3" /> Retry OCR
                              </Button>
                            )}

                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePage(index);
                              }}
                              data-testid={`button-remove-page-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {selectedPageIndex !== null && pages[selectedPageIndex] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Extracted Text - Page {selectedPageIndex + 1}
                    </h3>
                    {pages[selectedPageIndex].isProcessing ? (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing text recognition...</span>
                      </div>
                    ) : pages[selectedPageIndex].extractedText ? (
                      <ScrollArea className="h-[200px] rounded-lg bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {pages[selectedPageIndex].extractedText}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-muted-foreground italic">No text was extracted from this page.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => retryOcr(
                            pages[selectedPageIndex].id, 
                            pages[selectedPageIndex].imageData
                          )}
                          disabled={!isWorkerReady}
                          data-testid="button-retry-ocr-selected"
                        >
                          <Scan className="h-4 w-4" />
                          {isWorkerReady ? "Retry Text Extraction" : "OCR Loading..."}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4">Create PDF</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doc-name">Document Name</Label>
                      <Input
                        id="doc-name"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Enter document name"
                        className="mt-1"
                        data-testid="input-document-name"
                      />
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pages</span>
                        <span className="font-semibold">{pages.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">OCR Ready</span>
                        <span className="font-semibold">
                          {pages.filter(p => !p.isProcessing && p.extractedText).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={generatePdf}
                    disabled={pages.length === 0 || isGeneratingPdf}
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    data-testid="button-generate-pdf"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={sharePdf}
                    disabled={pages.length === 0 || isGeneratingPdf}
                    className="w-full gap-2"
                    data-testid="button-share-pdf"
                  >
                    <Share2 className="h-4 w-4" />
                    Share PDF
                  </Button>

                  {pages.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPages([]);
                        setSelectedPageIndex(null);
                      }}
                      className="w-full gap-2 text-muted-foreground hover:text-destructive"
                      data-testid="button-clear-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Pages
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Tips</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use good lighting for best OCR results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Keep documents flat and straight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Add multiple pages for multi-page documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Extracted text is included in the PDF</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
