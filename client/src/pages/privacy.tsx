import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, Lock, Database, Bell, Users, Globe, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)' }}>
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
                <h1 className="font-serif text-xl font-bold text-amber-100">Privacy Policy</h1>
                <p className="text-xs text-amber-300/60">Last updated: February 2026</p>
              </div>
            </div>
            <Shield className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Eye className="h-5 w-5 text-amber-400" />
                    Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>
                    Brew & Board Coffee ("we," "us," or "our"), operated by Darkwave Studios, LLC, is committed 
                    to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and 
                    safeguard your information when you use our B2B coffee catering platform at brewandboard.coffee.
                  </p>
                  <p>
                    By using our service, you consent to the data practices described in this policy. If you do 
                    not agree with these practices, please do not use our service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Database className="h-5 w-5 text-amber-400" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">Personal Information</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Name and contact information (email address, phone number)</li>
                      <li>Business name and delivery address</li>
                      <li>Payment information (processed securely through Stripe)</li>
                      <li>Account credentials (email and encrypted password)</li>
                      <li>Order history and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-100 mb-2">Automatically Collected Information</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Device information and browser type</li>
                      <li>IP address and general location</li>
                      <li>Usage data and interaction patterns</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Users className="h-5 w-5 text-amber-400" />
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Order Processing:</strong> To process and fulfill your catering orders</li>
                    <li><strong>Communication:</strong> To send order confirmations, delivery updates, and customer support responses</li>
                    <li><strong>SMS Notifications:</strong> To send order status and delivery updates via text message (with your consent)</li>
                    <li><strong>Payment Processing:</strong> To process payments securely through our payment processor (Stripe)</li>
                    <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our platform</li>
                    <li><strong>Security:</strong> To detect and prevent fraud and unauthorized access</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Bell className="h-5 w-5 text-amber-400" />
                    SMS Communications
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>
                    When you provide your phone number and consent to receive SMS messages, we may send you:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Order confirmation messages</li>
                    <li>Delivery status updates and ETA notifications</li>
                    <li>Driver arrival alerts</li>
                    <li>Important service announcements</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Message frequency varies</strong> based on your order activity. Standard message and 
                    data rates may apply. You can opt out at any time by replying STOP to any message. 
                    Reply HELP for assistance.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Globe className="h-5 w-5 text-amber-400" />
                    Information Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Vendors:</strong> To fulfill your orders (name, delivery address, order details)</li>
                    <li><strong>Delivery Partners:</strong> To coordinate delivery (DoorDash, Uber Direct, or our white-glove service)</li>
                    <li><strong>Payment Processors:</strong> Stripe processes all payments; we do not store full payment card details</li>
                    <li><strong>Communication Services:</strong> Twilio for SMS notifications, Resend for email</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-4">
                    We do not sell your personal information to third parties for marketing purposes.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Lock className="h-5 w-5 text-amber-400" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>We implement industry-standard security measures to protect your data:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Passwords are hashed using bcrypt encryption</li>
                    <li>All data is transmitted over HTTPS/TLS</li>
                    <li>Payment processing is handled by PCI-compliant Stripe</li>
                    <li>Database access is restricted and monitored</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                  <p className="mt-4">
                    While we strive to protect your information, no method of transmission over the Internet 
                    is 100% secure. We cannot guarantee absolute security.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Shield className="h-5 w-5 text-amber-400" />
                    Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt out of SMS communications at any time</li>
                    <li>Opt out of marketing emails</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, contact us at privacy@brewandboard.coffee or through our 
                    Contact page.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-amber-900/20 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-100">
                    <Mail className="h-5 w-5 text-amber-400" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-200/80 text-sm space-y-4">
                  <p>
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-amber-900/30 p-4 rounded-lg">
                    <p><strong>Brew & Board Coffee</strong></p>
                    <p>Operated by Darkwave Studios, LLC</p>
                    <p>Nashville, Tennessee</p>
                    <p className="mt-2">Email: privacy@brewandboard.coffee</p>
                    <p>Website: brewandboard.coffee</p>
                  </div>
                  <p className="mt-4 text-xs text-amber-300/60">
                    This Privacy Policy may be updated periodically. We will notify you of significant changes 
                    by posting the new policy on this page with an updated revision date.
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
