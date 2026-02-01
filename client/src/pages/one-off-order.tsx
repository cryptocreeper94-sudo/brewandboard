import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coffee, Truck, Crown, Clock, MapPin, Users, Calendar, ChevronRight, Check, Star, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type DeliveryType = "doordash" | "white_glove";
type MeetingType = "board_meeting" | "team_meeting" | "client_presentation" | "training_session" | "networking_event" | "office_party" | "other";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  notes?: string;
}

interface WhiteGlovePricing {
  setupFee: string;
  perPersonFee: string;
  headcount: number;
  totalWhiteGloveFee: string;
  includesSetup: boolean;
  includesPresentation: boolean;
  includesCleanup: boolean;
}

export default function OneOffOrderPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("doordash");
  const [zipCode, setZipCode] = useState("");
  const [zipChecked, setZipChecked] = useState(false);
  const [serviceAreaInfo, setServiceAreaInfo] = useState<any>(null);
  const [whiteGloveAvailable, setWhiteGloveAvailable] = useState(true);
  
  const [meetingType, setMeetingType] = useState<MeetingType>("team_meeting");
  const [headcount, setHeadcount] = useState(10);
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  const [whiteGlovePricing, setWhiteGlovePricing] = useState<WhiteGlovePricing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetingTypes = [
    { value: "board_meeting", label: "Board Meeting", icon: "👔" },
    { value: "team_meeting", label: "Team Meeting", icon: "👥" },
    { value: "client_presentation", label: "Client Presentation", icon: "📊" },
    { value: "training_session", label: "Training Session", icon: "📚" },
    { value: "networking_event", label: "Networking Event", icon: "🤝" },
    { value: "office_party", label: "Office Party", icon: "🎉" },
    { value: "other", label: "Other", icon: "📋" }
  ];

  const checkZipCode = async () => {
    if (!zipCode || zipCode.length < 5) {
      toast({ title: "Please enter a valid 5-digit zip code", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/service-areas/check/${zipCode}`);
      const data = await res.json();
      
      setServiceAreaInfo(data);
      setWhiteGloveAvailable(data.whiteGloveAvailable);
      setZipChecked(true);
      
      if (!data.inServiceArea) {
        toast({
          title: "Outside Service Area",
          description: "DoorDash delivery is available, but White Glove service is not in your area.",
          variant: "default"
        });
        setDeliveryType("doordash");
      }
    } catch (error) {
      toast({ title: "Error checking service area", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (deliveryType === "white_glove" && headcount > 0) {
      fetchWhiteGlovePricing();
    }
  }, [deliveryType, headcount]);

  const fetchWhiteGlovePricing = async () => {
    try {
      const res = await fetch(`/api/white-glove/pricing/calculate?headcount=${headcount}`);
      const data = await res.json();
      setWhiteGlovePricing(data.pricing);
    } catch (error) {
      console.error("Error fetching pricing:", error);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    if (deliveryType === "white_glove") {
      now.setDate(now.getDate() + 1);
    }
    return now.toISOString().split("T")[0];
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return zipChecked;
      case 2:
        return deliveryType && meetingType && headcount > 0;
      case 3:
        return requestedDate && requestedTime && deliveryAddress && contactName && contactPhone;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const items: OrderItem[] = [
      { name: "Coffee Service", quantity: headcount, price: "3.50" },
      { name: "Assorted Pastries", quantity: Math.ceil(headcount * 1.5), price: "2.75" }
    ];

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const serviceFee = deliveryType === "white_glove" ? parseFloat(whiteGlovePricing?.totalWhiteGloveFee || "50") : subtotal * 0.15;
    const deliveryFee = deliveryType === "doordash" ? 9.99 : 0;
    const total = subtotal + serviceFee + deliveryFee;

    try {
      const res = await fetch("/api/one-off-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryType,
          deliveryAddress,
          zipCode,
          meetingType,
          headcount,
          requestedDate,
          requestedTime,
          items,
          subtotal: subtotal.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          total: total.toFixed(2),
          contactName,
          contactPhone,
          contactEmail,
          specialInstructions,
          status: "pending"
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }

      toast({
        title: "Order Submitted!",
        description: deliveryType === "white_glove" 
          ? "Our team will contact you within 2 hours to confirm details."
          : "Your order is being processed. Track it in your dashboard."
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f09] via-[#2a1810] to-[#1a0f09]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="text-[#c4a47c] hover:text-[#d4b48c] mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-[#c4a47c] mb-3">
            One-Off Order
          </h1>
          <p className="text-[#a0896c] text-lg">
            Premium coffee and catering for your next meeting
          </p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-16 h-2 rounded-full transition-all ${
                s === step ? "bg-[#c4a47c]" : s < step ? "bg-[#5c4033]" : "bg-[#3a2a20]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Location
                  </CardTitle>
                  <CardDescription className="text-[#a0896c]">
                    Enter your zip code to check available services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-[#c4a47c]">Zip Code</Label>
                      <Input
                        type="text"
                        maxLength={5}
                        value={zipCode}
                        onChange={(e) => {
                          setZipCode(e.target.value.replace(/\D/g, ""));
                          setZipChecked(false);
                        }}
                        placeholder="37201"
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-zipcode"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={checkZipCode}
                        className="bg-[#5c4033] hover:bg-[#6d5040] text-white"
                        data-testid="button-check-zip"
                      >
                        Check Availability
                      </Button>
                    </div>
                  </div>

                  {zipChecked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30"
                    >
                      {serviceAreaInfo?.inServiceArea ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span>Great! You're in the {serviceAreaInfo.area?.name || "Nashville Metro"} service area.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <AlertCircle className="w-5 h-5" />
                          <span>Standard delivery available via DoorDash</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Choose Delivery Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(v) => setDeliveryType(v as DeliveryType)}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="doordash"
                      onClick={() => setDeliveryType("doordash")}
                      className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                        deliveryType === "doordash"
                          ? "border-[#c4a47c] bg-[#c4a47c]/10"
                          : "border-[#5c4033]/30 hover:border-[#5c4033]"
                      }`}
                      data-testid="button-option-doordash"
                    >
                      <RadioGroupItem value="doordash" id="doordash" className="sr-only" />
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-red-500/20">
                          <Truck className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">DoorDash Delivery</h3>
                          <p className="text-sm text-[#a0896c] mt-1">Fast, convenient delivery</p>
                        </div>
                        <ul className="text-sm text-[#a0896c] space-y-1">
                          <li>• Same-day available</li>
                          <li>• 2-hour minimum notice</li>
                          <li>• Real-time tracking</li>
                          <li>• $9.99 delivery fee</li>
                        </ul>
                      </div>
                    </Label>

                    <Label
                      htmlFor="white_glove"
                      onClick={() => whiteGloveAvailable && setDeliveryType("white_glove")}
                      className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                        !whiteGloveAvailable ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        deliveryType === "white_glove"
                          ? "border-[#c4a47c] bg-[#c4a47c]/10"
                          : "border-[#5c4033]/30 hover:border-[#5c4033]"
                      }`}
                      data-testid="button-option-white-glove"
                    >
                      <RadioGroupItem 
                        value="white_glove" 
                        id="white_glove" 
                        className="sr-only"
                        disabled={!whiteGloveAvailable}
                      />
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-[#c4a47c]/20 relative">
                          <Crown className="w-8 h-8 text-[#c4a47c]" />
                          <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            White Glove Service
                            <Badge className="bg-[#c4a47c] text-[#1a0f09]">Premium</Badge>
                          </h3>
                          <p className="text-sm text-[#a0896c] mt-1">Full presentation setup</p>
                        </div>
                        <ul className="text-sm text-[#a0896c] space-y-1">
                          <li>• Personal delivery by our team</li>
                          <li>• Meeting room setup</li>
                          <li>• Professional presentation</li>
                          <li>• 24-hour advance booking</li>
                        </ul>
                        {!whiteGloveAvailable && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                            Not available in your area
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                    <Coffee className="w-5 h-5" />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#c4a47c]">Meeting Type</Label>
                    <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
                      <SelectTrigger className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white" data-testid="select-meeting-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a1810] border-[#5c4033]">
                        {meetingTypes.map((mt) => (
                          <SelectItem key={mt.value} value={mt.value} className="text-white hover:bg-[#5c4033]/30">
                            <span className="flex items-center gap-2">
                              <span>{mt.icon}</span>
                              <span>{mt.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#c4a47c]">Expected Headcount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={headcount}
                      onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)}
                      className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                      data-testid="input-headcount"
                    />
                  </div>

                  {deliveryType === "white_glove" && whiteGlovePricing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-lg bg-[#c4a47c]/10 border border-[#c4a47c]/30"
                    >
                      <h4 className="text-[#c4a47c] font-semibold mb-2 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        White Glove Fee Breakdown
                      </h4>
                      <div className="space-y-1 text-sm text-[#a0896c]">
                        <div className="flex justify-between">
                          <span>Setup Fee:</span>
                          <span>${whiteGlovePricing.setupFee}</span>
                        </div>
                        {parseFloat(whiteGlovePricing.perPersonFee) > 0 && (
                          <div className="flex justify-between">
                            <span>Per Person ({headcount} guests):</span>
                            <span>${whiteGlovePricing.perPersonFee}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-[#c4a47c] pt-2 border-t border-[#5c4033]/30">
                          <span>Total White Glove Fee:</span>
                          <span>${whiteGlovePricing.totalWhiteGloveFee}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {whiteGlovePricing.includesSetup && (
                          <Badge className="bg-[#5c4033] text-[#c4a47c]">✓ Setup</Badge>
                        )}
                        {whiteGlovePricing.includesPresentation && (
                          <Badge className="bg-[#5c4033] text-[#c4a47c]">✓ Presentation</Badge>
                        )}
                        {whiteGlovePricing.includesCleanup && (
                          <Badge className="bg-[#5c4033] text-[#c4a47c]">✓ Cleanup</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#c4a47c]">Delivery Date</Label>
                      <Input
                        type="date"
                        min={getMinDate()}
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-date"
                      />
                      {deliveryType === "white_glove" && (
                        <p className="text-xs text-yellow-400 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          White Glove requires 24-hour advance booking
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-[#c4a47c]">Delivery Time</Label>
                      <Input
                        type="time"
                        value={requestedTime}
                        onChange={(e) => setRequestedTime(e.target.value)}
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-time"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#c4a47c]">Delivery Address</Label>
                    <Textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Full address including suite/floor number"
                      className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#c4a47c]">Contact Name</Label>
                      <Input
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <Label className="text-[#c4a47c]">Contact Phone</Label>
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div>
                      <Label className="text-[#c4a47c]">Contact Email</Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-[#1a0f09]/30 border border-[#5c4033]/30">
                    <Checkbox
                      id="sms-consent"
                      checked={smsConsent}
                      onCheckedChange={(checked) => setSmsConsent(checked === true)}
                      className="border-[#c4a47c] data-[state=checked]:bg-[#c4a47c] data-[state=checked]:text-[#1a0f09] mt-1"
                      data-testid="checkbox-sms-consent"
                    />
                    <label 
                      htmlFor="sms-consent" 
                      className="text-sm text-[#a0896c] leading-relaxed cursor-pointer"
                    >
                      I consent to receive SMS messages from Brew & Board Coffee regarding my order status and delivery updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.
                    </label>
                  </div>

                  <div>
                    <Label className="text-[#c4a47c]">Special Instructions</Label>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Parking instructions, access codes, dietary restrictions..."
                      className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                      data-testid="input-special-instructions"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30">
                        <h4 className="text-[#c4a47c] font-semibold mb-2">Delivery Type</h4>
                        <div className="flex items-center gap-2">
                          {deliveryType === "white_glove" ? (
                            <>
                              <Crown className="w-5 h-5 text-[#c4a47c]" />
                              <span className="text-white">White Glove Service</span>
                              <Badge className="bg-[#c4a47c] text-[#1a0f09]">Premium</Badge>
                            </>
                          ) : (
                            <>
                              <Truck className="w-5 h-5 text-red-400" />
                              <span className="text-white">DoorDash Delivery</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30">
                        <h4 className="text-[#c4a47c] font-semibold mb-2">Meeting Details</h4>
                        <div className="space-y-1 text-[#a0896c]">
                          <p><Users className="w-4 h-4 inline mr-2" />{headcount} attendees</p>
                          <p>{meetingTypes.find(m => m.value === meetingType)?.icon} {meetingTypes.find(m => m.value === meetingType)?.label}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30">
                        <h4 className="text-[#c4a47c] font-semibold mb-2">Delivery Info</h4>
                        <div className="space-y-1 text-[#a0896c] text-sm">
                          <p><Calendar className="w-4 h-4 inline mr-2" />{requestedDate} at {requestedTime}</p>
                          <p><MapPin className="w-4 h-4 inline mr-2" />{deliveryAddress}</p>
                          <p>Contact: {contactName} - {contactPhone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#c4a47c]/10 border border-[#c4a47c]/30">
                      <h4 className="text-[#c4a47c] font-semibold mb-4">Price Estimate</h4>
                      <div className="space-y-2 text-[#a0896c]">
                        <div className="flex justify-between">
                          <span>Coffee Service ({headcount}x)</span>
                          <span>${(headcount * 3.50).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assorted Pastries ({Math.ceil(headcount * 1.5)}x)</span>
                          <span>${(Math.ceil(headcount * 1.5) * 2.75).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-[#5c4033]/30 my-2" />
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${((headcount * 3.50) + (Math.ceil(headcount * 1.5) * 2.75)).toFixed(2)}</span>
                        </div>
                        {deliveryType === "white_glove" ? (
                          <div className="flex justify-between text-[#c4a47c]">
                            <span>White Glove Fee</span>
                            <span>${whiteGlovePricing?.totalWhiteGloveFee || "50.00"}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Service Fee (15%)</span>
                              <span>${(((headcount * 3.50) + (Math.ceil(headcount * 1.5) * 2.75)) * 0.15).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>$9.99</span>
                            </div>
                          </>
                        )}
                        <div className="border-t border-[#c4a47c]/30 my-2" />
                        <div className="flex justify-between text-lg font-semibold text-[#c4a47c]">
                          <span>Estimated Total</span>
                          <span>
                            ${(
                              (headcount * 3.50) + 
                              (Math.ceil(headcount * 1.5) * 2.75) + 
                              (deliveryType === "white_glove" 
                                ? parseFloat(whiteGlovePricing?.totalWhiteGloveFee || "50") 
                                : (((headcount * 3.50) + (Math.ceil(headcount * 1.5) * 2.75)) * 0.15) + 9.99
                              )
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#a0896c] mt-4">
                        * Final price may vary based on menu selection
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="border-[#5c4033] text-[#c4a47c] hover:bg-[#5c4033]/20"
            data-testid="button-previous"
          >
            Previous
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!validateStep()}
              className="bg-[#5c4033] hover:bg-[#6d5040] text-white"
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#c4a47c] hover:bg-[#d4b48c] text-[#1a0f09] font-semibold"
              data-testid="button-submit-order"
            >
              {isSubmitting ? "Submitting..." : "Submit Order"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
