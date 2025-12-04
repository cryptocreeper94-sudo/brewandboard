import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Send, User, MessageSquare, CheckCircle, Loader2, Coffee } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-amber-800/30" style={{ background: 'rgba(26, 15, 9, 0.9)' }}>
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-bold text-amber-100">Contact Us</h1>
                <p className="text-xs text-amber-300/60">We'd love to hear from you</p>
              </div>
            </div>
            <Mail className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-amber-100 mb-2">
              Get in Touch
            </h2>
            <p className="text-amber-200/70 max-w-md mx-auto">
              Have a question, suggestion, or need support? Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-amber-900/20 border-amber-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  Send a Message
                </CardTitle>
                <CardDescription className="text-amber-300/60">
                  Fill out the form below and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-100 mb-2">Message Sent!</h3>
                    <p className="text-amber-200/70 mb-4">
                      Thank you for reaching out. We'll respond within 24-48 hours.
                    </p>
                    <Button
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                      className="border-amber-600/50 text-amber-200 hover:bg-amber-800/30"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-amber-200">Your Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/50" />
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="pl-10 bg-amber-950/50 border-amber-700/30 text-amber-100 placeholder:text-amber-400/30"
                            data-testid="input-name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-amber-200">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/50" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="pl-10 bg-amber-950/50 border-amber-700/30 text-amber-100 placeholder:text-amber-400/30"
                            data-testid="input-email"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-amber-200">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100 placeholder:text-amber-400/30"
                        data-testid="input-subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-amber-200">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100 placeholder:text-amber-400/30 resize-none"
                        data-testid="input-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Direct Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-amber-900/20 border-amber-700/30">
              <CardContent className="pt-6 text-center">
                <p className="text-amber-200/70 text-sm mb-2">
                  Prefer email? Reach us directly at:
                </p>
                <a 
                  href="mailto:cryptocreeper94@gmail.com"
                  className="text-amber-400 hover:text-amber-300 font-semibold text-lg transition-colors"
                  data-testid="link-email"
                >
                  cryptocreeper94@gmail.com
                </a>
                <p className="text-amber-300/50 text-xs mt-4">
                  Response time: Usually within 24-48 business hours
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
