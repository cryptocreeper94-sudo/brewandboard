import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PortfolioPage from "@/pages/portfolio";
import SchedulePage from "@/pages/schedule";
import ScanPage from "@/pages/scan";
import DevelopersPage from "@/pages/developers";
import PricingPage from "@/pages/pricing";
import PaymentSuccessPage from "@/pages/payment-success";
import VerifyPage from "@/pages/verify";
import BlockchainTutorialPage from "@/pages/blockchain-tutorial";
import HallmarkSuccessPage from "@/pages/hallmark-success";
import AdminPage from "@/pages/admin";
import MyHallmarksPage from "@/pages/my-hallmarks";
import { MascotButton } from "@/components/MascotButton";
import { MascotPopover } from "@/components/MascotPopover";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/scan" component={ScanPage} />
      <Route path="/developers" component={DevelopersPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/verify/:code" component={VerifyPage} />
      <Route path="/blockchain-tutorial" component={BlockchainTutorialPage} />
      <Route path="/hallmark-success" component={HallmarkSuccessPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/my-hallmarks" component={MyHallmarksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function FooterWrapper() {
  const [location] = useLocation();
  const hideFooterPages = ["/"];
  
  if (hideFooterPages.includes(location)) return null;
  
  return <Footer />;
}

function MascotWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const handleSpeechEnd = (text: string) => {
    toast({
      title: "Voice captured!",
      description: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    });
  };

  return (
    <>
      <MascotButton
        onSpeechEnd={handleSpeechEnd}
        onChatOpen={() => setIsChatOpen(true)}
        showChat={true}
      />
      <MascotPopover
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <FooterWrapper />
        <MascotWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
