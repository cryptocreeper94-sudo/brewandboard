import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Building2, Rocket, DollarSign, Users, MapPin, Coffee, Mail, CheckCircle, Star, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const highlights = [
  { icon: MapPin, label: "Nashville-First", value: "Strategic Market Entry" },
  { icon: Users, label: "B2B Focus", value: "High-Value Customers" },
  { icon: Rocket, label: "Scalable Model", value: "City-by-City Expansion" },
  { icon: DollarSign, label: "Recurring Revenue", value: "Subscription Tiers" },
];

const franchiseFeatures = [
  "Proven business model with established vendor relationships",
  "Full training and operational support",
  "Exclusive territory protection",
  "Marketing and branding toolkit",
  "Access to proprietary technology platform",
  "Blockchain hallmark verification system",
  "Ongoing mentorship and support",
];

const investmentHighlights = [
  { title: "Seed Round", description: "Currently seeking strategic investors", status: "active" },
  { title: "Market Size", description: "$4.2B corporate catering market", status: "info" },
  { title: "Growth Rate", description: "18% CAGR projected", status: "info" },
  { title: "First Mover", description: "Nashville's first B2B coffee concierge", status: "advantage" },
];

export default function InvestorPage() {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-amber-800/30" style={{ background: 'rgba(26, 15, 9, 0.9)' }}>
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-bold text-amber-100">Investors & Franchise</h1>
                <p className="text-xs text-amber-300/60">Join the Brew & Board journey</p>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Growth Opportunity
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-100 mb-4">
              Be Part of Nashville's Catering Revolution
            </h2>
            <p className="text-amber-200/70 max-w-2xl mx-auto text-lg">
              Brew & Board is redefining how businesses experience premium brews and boards — 
              from artisan coffee to curated food boards. Join us as an investor or franchise partner.
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

          {/* Investment Opportunity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <DollarSign className="h-5 w-5 text-amber-400" />
                  Investment Opportunity
                </CardTitle>
                <CardDescription className="text-amber-300/60">
                  Join our seed round and help scale Brew & Board nationally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investmentHighlights.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-700/20"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                        item.status === 'advantage' ? 'bg-amber-400' : 'bg-amber-600'
                      }`} />
                      <div>
                        <p className="font-semibold text-amber-100">{item.title}</p>
                        <p className="text-sm text-amber-200/70">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-100 mb-1">Why Brew & Board?</p>
                      <p className="text-sm text-amber-200/70">
                        We combine the $100B+ coffee industry with B2B SaaS recurring revenue models. 
                        Our blockchain hallmark technology adds unique IP value and customer stickiness. 
                        First-mover advantage in Nashville's thriving business ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Franchise Opportunity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <Building2 className="h-5 w-5 text-amber-400" />
                  Franchise Opportunity
                </CardTitle>
                <CardDescription className="text-amber-300/60">
                  Bring Brew & Board to your city
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-amber-200/80">
                  We're seeking ambitious entrepreneurs to bring the Brew & Board experience to major 
                  metropolitan areas. Our franchise model provides everything you need to succeed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {franchiseFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-amber-200/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-700/20">
                  <div className="flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-100 mb-1">Ideal Franchise Partner</p>
                      <p className="text-sm text-amber-200/70">
                        We're looking for partners with strong business acumen, local market knowledge, 
                        and a passion for coffee culture. Restaurant, hospitality, or B2B sales 
                        experience is a plus.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <h3 className="font-serif text-xl font-bold text-amber-100 mb-2">
                  Ready to Join Us?
                </h3>
                <p className="text-amber-200/70 mb-6 max-w-md mx-auto">
                  Whether you're interested in investing or franchising, we'd love to hear from you. 
                  Let's discuss how we can grow together.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/contact">
                    <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2" data-testid="button-contact-investor">
                      <Mail className="h-4 w-4" />
                      Contact Us
                    </Button>
                  </Link>
                  <a href="mailto:cryptocreeper94@gmail.com?subject=Investment%20Inquiry%20-%20Brew%20%26%20Board">
                    <Button variant="outline" className="border-amber-600/50 text-amber-200 hover:bg-amber-800/30 gap-2" data-testid="button-email-investor">
                      <DollarSign className="h-4 w-4" />
                      Investment Inquiry
                    </Button>
                  </a>
                </div>
                <p className="text-amber-300/50 text-xs mt-6">
                  Confidential discussions available • NDA provided upon request
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
