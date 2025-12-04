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
import { MascotButton } from "@/components/MascotButton";
import { MascotPopover } from "@/components/MascotPopover";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function MascotWrapper() {
  const [location] = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();
  
  const hideMascotPages = ["/"];
  const shouldShowMascot = !hideMascotPages.includes(location);

  const handleSpeechEnd = (text: string) => {
    toast({
      title: "Voice captured!",
      description: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    });
  };

  if (!shouldShowMascot) return null;

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
        <MascotWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
