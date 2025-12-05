import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  DollarSign, 
  Users, 
  Rocket, 
  CheckCircle2, 
  Star,
  Coffee,
  Truck,
  Shield,
  Clock,
  TrendingUp,
  Send,
  Sparkles,
  Award,
  Globe,
  Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FRANCHISE_TIERS } from "@shared/schema";

const highlights = [
  { icon: MapPin, label: "Territory Ownership", value: "Exclusive Markets" },
  { icon: DollarSign, label: "Revenue Share", value: "70-90% Retained" },
  { icon: Users, label: "37+ Vendors", value: "Pre-Built Network" },
  { icon: Shield, label: "Blockchain Verified", value: "Hallmark System" },
];

const whyFranchise = [
  {
    icon: Building2,
    title: "Turnkey Business",
    description: "Established vendor relationships, proven platform, and complete training"
  },
  {
    icon: Globe,
    title: "Growing Market",
    description: "$4.2B corporate catering market with 18% annual growth rate"
  },
  {
    icon: Award,
    title: "First Mover Advantage",
    description: "Be the first B2B catering concierge in your city"
  },
  {
    icon: Handshake,
    title: "Ongoing Support",
    description: "Dedicated account manager, training, and marketing support"
  }
];

export default function FranchisePage() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interestedTier: "",
    preferredTerritory: "",
    investmentBudget: "",
    timelineToStart: "",
    hasBusinessExperience: false,
    hasFoodServiceExperience: false,
    currentOccupation: "",
    additionalNotes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/franchise/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setFormSubmitted(true);
        toast({
          title: "Inquiry Submitted!",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiers = Object.entries(FRANCHISE_TIERS).map(([key, tier]) => ({
    id: key,
    ...tier
  }));

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-amber-800/30" style={{ background: 'rgba(26, 15, 9, 0.9)' }}>
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-bold text-amber-100">Franchise Opportunity</h1>
                <p className="text-xs text-amber-300/60">Own your territory</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Now Accepting Applications
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-100 mb-4">
              Own a Brew & Board Territory
            </h2>
            <p className="text-amber-200/70 max-w-2xl mx-auto text-lg mb-8">
              Join the first B2B catering concierge franchise. Bring premium brews and boards 
              to businesses in your city with our proven platform and vendor network.
            </p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {highlights.map((item, index) => (
              <Card key={index} className="bg-amber-900/20 border-amber-700/30 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <p className="text-xs text-amber-300/60 mb-1">{item.label}</p>
                  <p className="font-semibold text-amber-100 text-sm">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Why Franchise Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-serif text-2xl font-bold text-amber-100 text-center mb-6">
              Why Franchise With Us?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {whyFranchise.map((item, index) => (
                <Card key={index} className="bg-amber-900/20 border-amber-700/30">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 mb-3 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-100 mb-2">{item.title}</h4>
                    <p className="text-sm text-amber-200/60">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Two-Tier Hallmark System Explainer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <Shield className="h-5 w-5 text-amber-400" />
                  Two-Tier Hallmark System
                </CardTitle>
                <CardDescription className="text-amber-300/60">
                  Choose the ownership model that fits your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-700/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-amber-100">Subscriber Managed</h4>
                    </div>
                    <p className="text-sm text-amber-200/70 mb-3">
                      Brew & Board controls the hallmark system. You focus on operations while we handle the technology.
                    </p>
                    <ul className="space-y-1 text-sm text-amber-200/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        No upfront franchise fee
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Monthly subscription model
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Full platform access
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-600/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-amber-400" />
                      </div>
                      <h4 className="font-semibold text-amber-100">Franchise Owned</h4>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-amber-200/70 mb-3">
                      You own your territory completely. Full data portability, custom branding, and hallmark control.
                    </p>
                    <ul className="space-y-1 text-sm text-amber-200/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Territory ownership
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Custom hallmark prefix (BB-YOURMARKET)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Higher revenue share (70-90%)
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Franchise Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="font-serif text-2xl font-bold text-amber-100 text-center mb-6">
              Franchise Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all cursor-pointer ${
                      selectedTier === tier.id 
                        ? 'bg-gradient-to-br from-amber-800/50 to-amber-900/30 border-amber-500 ring-2 ring-amber-500/50' 
                        : 'bg-amber-900/20 border-amber-700/30 hover:border-amber-600/50'
                    } ${'popular' in tier && tier.popular ? 'ring-2 ring-amber-500/30' : ''}`}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setFormData(prev => ({ ...prev, interestedTier: tier.id }));
                    }}
                    data-testid={`tier-card-${tier.id}`}
                  >
                    {'popular' in tier && tier.popular && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-tl-none rounded-br-none bg-amber-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-amber-100">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-amber-400">{tier.fee}</span>
                        <span className="text-amber-300/60 text-sm">one-time</span>
                      </div>
                      <p className="text-sm text-amber-200/60">{tier.territories}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-amber-200/80">
                          <span>Royalty</span>
                          <span className="font-semibold text-amber-100">{tier.royaltyPercent}</span>
                        </div>
                        <div className="flex justify-between text-amber-200/80">
                          <span>Platform Fee</span>
                          <span className="font-semibold text-amber-100">{tier.platformFee}</span>
                        </div>
                        <div className="flex justify-between text-amber-200/80">
                          <span>Revenue Share</span>
                          <span className="font-semibold text-amber-100">{tier.hallmarkShare}</span>
                        </div>
                        <div className="flex justify-between text-amber-200/80">
                          <span>Support</span>
                          <span className="font-semibold text-amber-100">{tier.supportHours}hr response</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-amber-700/30 pt-4">
                        <ul className="space-y-2">
                          {tier.features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-200/70">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 5 && (
                            <li className="text-xs text-amber-400">
                              +{tier.features.length - 5} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            id="apply"
          >
            <Card className="bg-amber-900/20 border-amber-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <Send className="h-5 w-5 text-amber-400" />
                  Apply for a Franchise
                </CardTitle>
                <CardDescription className="text-amber-300/60">
                  Fill out the form below and we'll contact you within 48 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-amber-100 mb-2">Application Submitted!</h3>
                      <p className="text-amber-200/70">
                        Thank you for your interest in Brew & Board. Our franchise team will contact you within 48 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {/* Contact Information */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-100 mb-4">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-amber-200">Full Name *</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="John Smith"
                              data-testid="input-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-amber-200">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="john@example.com"
                              data-testid="input-email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-amber-200">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="(615) 555-0123"
                              data-testid="input-phone"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-amber-200">Company (if applicable)</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="Your Company LLC"
                              data-testid="input-company"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Franchise Interest */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-100 mb-4">Franchise Interest</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tier" className="text-amber-200">Interested Tier</Label>
                            <Select 
                              value={formData.interestedTier} 
                              onValueChange={(value) => {
                                setFormData(prev => ({ ...prev, interestedTier: value }));
                                setSelectedTier(value);
                              }}
                            >
                              <SelectTrigger className="bg-amber-950/30 border-amber-700/30 text-amber-100" data-testid="select-tier">
                                <SelectValue placeholder="Select a tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="starter">Starter ($7,500)</SelectItem>
                                <SelectItem value="professional">Professional ($15,000)</SelectItem>
                                <SelectItem value="enterprise">Enterprise ($35,000)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="territory" className="text-amber-200">Preferred Territory *</Label>
                            <Input
                              id="territory"
                              required
                              value={formData.preferredTerritory}
                              onChange={(e) => setFormData(prev => ({ ...prev, preferredTerritory: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="e.g., Atlanta, Memphis, Austin"
                              data-testid="input-territory"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="budget" className="text-amber-200">Investment Budget</Label>
                            <Select 
                              value={formData.investmentBudget} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, investmentBudget: value }))}
                            >
                              <SelectTrigger className="bg-amber-950/30 border-amber-700/30 text-amber-100" data-testid="select-budget">
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-10k">Under $10,000</SelectItem>
                                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                                <SelectItem value="over-50k">Over $50,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timeline" className="text-amber-200">Timeline to Start</Label>
                            <Select 
                              value={formData.timelineToStart} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, timelineToStart: value }))}
                            >
                              <SelectTrigger className="bg-amber-950/30 border-amber-700/30 text-amber-100" data-testid="select-timeline">
                                <SelectValue placeholder="When would you like to start?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediately">Immediately</SelectItem>
                                <SelectItem value="1-3-months">1-3 months</SelectItem>
                                <SelectItem value="3-6-months">3-6 months</SelectItem>
                                <SelectItem value="6-12-months">6-12 months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Background */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-100 mb-4">Your Background</h4>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="business-exp"
                              checked={formData.hasBusinessExperience}
                              onCheckedChange={(checked) => 
                                setFormData(prev => ({ ...prev, hasBusinessExperience: checked as boolean }))
                              }
                              className="border-amber-700/50"
                              data-testid="checkbox-business"
                            />
                            <Label htmlFor="business-exp" className="text-amber-200/80 text-sm">
                              I have business ownership or management experience
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="food-exp"
                              checked={formData.hasFoodServiceExperience}
                              onCheckedChange={(checked) => 
                                setFormData(prev => ({ ...prev, hasFoodServiceExperience: checked as boolean }))
                              }
                              className="border-amber-700/50"
                              data-testid="checkbox-food"
                            />
                            <Label htmlFor="food-exp" className="text-amber-200/80 text-sm">
                              I have food service or hospitality experience
                            </Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="occupation" className="text-amber-200">Current Occupation</Label>
                            <Input
                              id="occupation"
                              value={formData.currentOccupation}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentOccupation: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100"
                              placeholder="e.g., Sales Manager, Business Owner"
                              data-testid="input-occupation"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes" className="text-amber-200">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              value={formData.additionalNotes}
                              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                              className="bg-amber-950/30 border-amber-700/30 text-amber-100 min-h-[100px]"
                              placeholder="Tell us about yourself and why you're interested in a Brew & Board franchise..."
                              data-testid="textarea-notes"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-6"
                        data-testid="button-submit"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Franchise Application
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-serif text-2xl font-bold text-amber-100 text-center mb-6">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "What's included in the franchise fee?",
                  a: "The franchise fee includes territory rights, complete training, access to our vendor network, marketing materials, the Brew & Board platform, and blockchain hallmark system integration."
                },
                {
                  q: "How do royalties work?",
                  a: "Royalties are calculated as a percentage of each order processed through the platform. Higher tiers enjoy lower royalty rates, meaning you keep more of each sale."
                },
                {
                  q: "Can I upgrade my tier later?",
                  a: "Yes! You can upgrade to a higher tier at any time by paying the difference in franchise fees. Your territory rights and revenue share will be updated accordingly."
                },
                {
                  q: "What's the Hallmark system?",
                  a: "The Hallmark system is our blockchain-based verification system. As a franchise owner, you can mint verified documents and certificates with your custom prefix (e.g., BB-ATLANTA)."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-amber-900/20 border-amber-700/30">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-amber-100 mb-2">{faq.q}</h4>
                    <p className="text-sm text-amber-200/70">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
