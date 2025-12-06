import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Coffee,
  Truck,
  Clock,
  TrendingUp,
  Send,
  Sparkles,
  Heart,
  Utensils,
  Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  { icon: Users, label: "B2B Customers", value: "New Revenue Stream" },
  { icon: DollarSign, label: "No Upfront Costs", value: "Free to Join" },
  { icon: Truck, label: "Delivery Handled", value: "We Coordinate" },
  { icon: TrendingUp, label: "Business Growth", value: "More Orders" },
];

const whyJoin = [
  {
    icon: Store,
    title: "Reach Business Clients",
    description: "Access Nashville's corporate meeting and event market without marketing costs"
  },
  {
    icon: Coffee,
    title: "Catering Made Easy",
    description: "We handle ordering, coordination, and delivery logistics for you"
  },
  {
    icon: Heart,
    title: "Local First",
    description: "We prioritize Nashville's independent shops over national chains"
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Accept orders that fit your capacity - you're always in control"
  }
];

const businessTypes = [
  { value: "coffee_shop", label: "Coffee Shop / Cafe" },
  { value: "bakery", label: "Bakery / Pastry Shop" },
  { value: "donut_shop", label: "Donut Shop" },
  { value: "juice_bar", label: "Juice Bar / Smoothies" },
  { value: "bubble_tea", label: "Bubble Tea / Boba" },
  { value: "breakfast", label: "Breakfast / Brunch Spot" },
  { value: "deli", label: "Deli / Sandwich Shop" },
  { value: "other", label: "Other" }
];

export default function VendorsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    ownerName: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    address: "",
    city: "Nashville",
    zipCode: "",
    neighborhood: "",
    yearsInBusiness: "",
    averageOrderValue: "",
    menuHighlights: "",
    canHandleCatering: true,
    maxOrderSize: "",
    leadTimeNeeded: "",
    whyJoin: "",
    additionalNotes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/vendors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setFormSubmitted(true);
        toast({
          title: "Application Submitted!",
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

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-amber-600/20 text-amber-300 border-amber-500/30">
            <Store className="w-3 h-3 mr-1" />
            Vendor Partnership
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-100 mb-4">
            Join Our Vendor Network
          </h1>
          <p className="text-xl text-amber-200/80 max-w-2xl mx-auto">
            Partner with Nashville's premier B2B coffee and catering concierge. 
            Reach business clients without the hassle.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 border-amber-700/30 text-center">
                <CardContent className="pt-6">
                  <item.icon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-200/60 text-sm">{item.label}</p>
                  <p className="text-amber-100 font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {whyJoin.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-amber-900/30 to-amber-950/30 border-amber-700/20 h-full">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-600/20">
                    <item.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-100 mb-1">{item.title}</h3>
                    <p className="text-amber-200/70">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {formSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-green-900/40 to-green-950/40 border-green-700/30">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-green-100 mb-4">
                  Application Received!
                </h2>
                <p className="text-green-200/80 mb-6">
                  Thank you for your interest in partnering with Brew & Board. 
                  Our team will review your application and contact you within 48 hours.
                </p>
                <Link href="/dashboard">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Return to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-amber-900/30 to-amber-950/40 border-amber-700/20">
              <CardHeader className="border-b border-amber-700/20">
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Vendor Application
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-200">Business Name *</Label>
                      <Input
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                        placeholder="Your coffee shop name"
                        data-testid="input-business-name"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-200">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => setFormData({...formData, businessType: value})}
                      >
                        <SelectTrigger className="bg-amber-950/50 border-amber-700/30 text-amber-100" data-testid="select-business-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-200">Owner/Manager Name *</Label>
                      <Input
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                        placeholder="Your name"
                        data-testid="input-owner-name"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-200">Email *</Label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                        placeholder="you@yourbusiness.com"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-200">Phone *</Label>
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                        placeholder="(615) 555-0123"
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-200">Instagram Handle</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                        <Input
                          value={formData.instagram}
                          onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                          className="bg-amber-950/50 border-amber-700/30 text-amber-100 pl-10"
                          placeholder="yourbusiness"
                          data-testid="input-instagram"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-amber-200">Website</Label>
                    <Input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                      placeholder="yourbusiness.com"
                      data-testid="input-website"
                    />
                  </div>

                  <div className="border-t border-amber-700/20 pt-6">
                    <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      Location
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-amber-200">Street Address *</Label>
                        <Input
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                          placeholder="123 Main Street"
                          data-testid="input-address"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-amber-200">City *</Label>
                          <Input
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                            data-testid="input-city"
                          />
                        </div>
                        <div>
                          <Label className="text-amber-200">ZIP Code *</Label>
                          <Input
                            required
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                            placeholder="37201"
                            data-testid="input-zip"
                          />
                        </div>
                        <div>
                          <Label className="text-amber-200">Neighborhood</Label>
                          <Input
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                            className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                            placeholder="East Nashville"
                            data-testid="input-neighborhood"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-amber-700/20 pt-6">
                    <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-amber-400" />
                      Business Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-amber-200">Years in Business</Label>
                        <Select
                          value={formData.yearsInBusiness}
                          onValueChange={(value) => setFormData({...formData, yearsInBusiness: value})}
                        >
                          <SelectTrigger className="bg-amber-950/50 border-amber-700/30 text-amber-100" data-testid="select-years">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                            <SelectItem value="1_3">1-3 years</SelectItem>
                            <SelectItem value="3_5">3-5 years</SelectItem>
                            <SelectItem value="5_10">5-10 years</SelectItem>
                            <SelectItem value="10_plus">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-amber-200">Average Order Value</Label>
                        <Select
                          value={formData.averageOrderValue}
                          onValueChange={(value) => setFormData({...formData, averageOrderValue: value})}
                        >
                          <SelectTrigger className="bg-amber-950/50 border-amber-700/30 text-amber-100" data-testid="select-avg-order">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_25">Under $25</SelectItem>
                            <SelectItem value="25_50">$25 - $50</SelectItem>
                            <SelectItem value="50_100">$50 - $100</SelectItem>
                            <SelectItem value="100_plus">$100+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-amber-200">Max Order Size (people)</Label>
                        <Select
                          value={formData.maxOrderSize}
                          onValueChange={(value) => setFormData({...formData, maxOrderSize: value})}
                        >
                          <SelectTrigger className="bg-amber-950/50 border-amber-700/30 text-amber-100" data-testid="select-max-order">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">Up to 10 people</SelectItem>
                            <SelectItem value="25">Up to 25 people</SelectItem>
                            <SelectItem value="50">Up to 50 people</SelectItem>
                            <SelectItem value="100">Up to 100 people</SelectItem>
                            <SelectItem value="100_plus">100+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-amber-200">Lead Time Needed</Label>
                        <Select
                          value={formData.leadTimeNeeded}
                          onValueChange={(value) => setFormData({...formData, leadTimeNeeded: value})}
                        >
                          <SelectTrigger className="bg-amber-950/50 border-amber-700/30 text-amber-100" data-testid="select-lead-time">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2_hours">2 hours</SelectItem>
                            <SelectItem value="4_hours">4 hours</SelectItem>
                            <SelectItem value="same_day">Same day (morning order)</SelectItem>
                            <SelectItem value="24_hours">24 hours</SelectItem>
                            <SelectItem value="48_hours">48 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-amber-200">Menu Highlights</Label>
                      <Textarea
                        value={formData.menuHighlights}
                        onChange={(e) => setFormData({...formData, menuHighlights: e.target.value})}
                        className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                        placeholder="Tell us about your signature items, specialties, or what makes your menu unique..."
                        rows={3}
                        data-testid="textarea-menu"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox 
                        id="catering"
                        checked={formData.canHandleCatering}
                        onCheckedChange={(checked) => setFormData({...formData, canHandleCatering: checked as boolean})}
                        data-testid="checkbox-catering"
                      />
                      <Label htmlFor="catering" className="text-amber-200">
                        We can handle catering/large orders
                      </Label>
                    </div>
                  </div>

                  <div className="border-t border-amber-700/20 pt-6">
                    <Label className="text-amber-200">Why do you want to join Brew & Board?</Label>
                    <Textarea
                      value={formData.whyJoin}
                      onChange={(e) => setFormData({...formData, whyJoin: e.target.value})}
                      className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                      placeholder="Tell us what interests you about partnering with us..."
                      rows={3}
                      data-testid="textarea-why-join"
                    />
                  </div>

                  <div>
                    <Label className="text-amber-200">Additional Notes</Label>
                    <Textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                      className="bg-amber-950/50 border-amber-700/30 text-amber-100"
                      placeholder="Anything else we should know?"
                      rows={2}
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-6 shine-effect"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
