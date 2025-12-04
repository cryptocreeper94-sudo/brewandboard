import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Clock, Coffee } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsPage() {
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
                <h1 className="font-serif text-xl font-bold text-amber-100">Terms & Conditions</h1>
                <p className="text-xs text-amber-300/60">Last updated: December 2024</p>
              </div>
            </div>
            <FileText className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Coffee className="h-5 w-5 text-amber-400" />
                    Welcome to Brew & Board Coffee
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>
                    These Terms and Conditions ("Terms") govern your use of the Brew & Board Coffee platform 
                    operated by Darkwave Studios, LLC ("we," "us," or "our"). By accessing or using our 
                    service, you agree to be bound by these Terms.
                  </p>
                  <p>
                    Brew & Board Coffee is a B2B coffee delivery concierge service connecting businesses 
                    with local Nashville coffee shops for pre-meeting coffee service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Scale className="h-5 w-5 text-amber-400" />
                    Service Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">1. Order Placement & Fulfillment</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Orders must be placed at least 2 hours in advance for guaranteed delivery</li>
                      <li>We act as a concierge service and coordinate with third-party vendors and delivery services</li>
                      <li>Delivery times are estimates and may vary based on traffic, weather, and vendor availability</li>
                      <li>We reserve the right to cancel orders if vendors or delivery partners are unavailable</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">2. Pricing & Fees</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>A 15% service fee applies to all one-off orders</li>
                      <li>A $5 delivery coordination fee applies to each order</li>
                      <li>Subscription tiers offer reduced or waived fees based on plan level</li>
                      <li>Prices are subject to change with notice</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">3. Cancellation Policy</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Orders may be cancelled up to 1 hour before scheduled delivery for a full refund</li>
                      <li>Cancellations within 1 hour may be subject to partial charges</li>
                      <li>No-shows will be charged in full</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Blockchain Hallmarks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Shield className="h-5 w-5 text-amber-400" />
                    Blockchain Hallmark Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>
                    Brew & Board Coffee offers blockchain-verified document hallmarking as an optional premium service.
                  </p>
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">Hallmark Terms</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Hallmarks are minted on the Solana blockchain for $1.99 per hallmark (Enterprise tier exempt)</li>
                      <li>Monthly hallmark limits apply based on subscription tier</li>
                      <li>Hallmarks are permanent and cannot be deleted once anchored to the blockchain</li>
                      <li>Hallmarks can be revoked (marked invalid) but the blockchain record remains</li>
                      <li>We do not guarantee document authenticity - hallmarks only verify the document hash at time of minting</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Disclaimers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-red-900/20 border-red-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Important Disclaimers
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-red-200/80 text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-100 mb-2">Limitation of Liability</h4>
                    <p>
                      BREW & BOARD COFFEE AND DARKWAVE STUDIOS, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                      INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO 
                      LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR IN CONNECTION WITH 
                      YOUR USE OF OUR SERVICE.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-100 mb-2">Third-Party Services</h4>
                    <p>
                      We coordinate with third-party coffee vendors and delivery services. We are not responsible 
                      for the quality, safety, or timeliness of products or services provided by these third parties. 
                      Any issues with vendor products should be reported to us, but resolution is not guaranteed.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-100 mb-2">Food Safety & Allergies</h4>
                    <p>
                      We do not prepare food or beverages. Customers with food allergies or dietary restrictions 
                      should verify ingredient information directly with the vendor. We cannot guarantee 
                      allergen-free or contamination-free products.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-100 mb-2">Service Availability</h4>
                    <p>
                      Our service is provided "as is" without warranty. We do not guarantee uninterrupted 
                      availability and may suspend or terminate service at any time without notice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Clock className="h-5 w-5 text-amber-400" />
                    User Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must provide accurate delivery information and be available to receive orders</li>
                    <li>You are responsible for maintaining the confidentiality of your account PIN</li>
                    <li>You agree not to use our service for any unlawful purpose</li>
                    <li>You agree to pay all fees associated with your orders and subscriptions</li>
                    <li>You understand that blockchain transactions are irreversible</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardContent className="pt-6 text-amber-200/80 text-sm text-center">
                  <p>
                    For questions about these Terms, please contact us at{" "}
                    <a href="mailto:cryptocreeper94@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                      cryptocreeper94@gmail.com
                    </a>
                  </p>
                  <p className="mt-4 text-amber-300/50 text-xs">
                    Brew & Board Coffee is a service of Darkwave Studios, LLC
                    <br />
                    Nashville, Tennessee, USA
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
