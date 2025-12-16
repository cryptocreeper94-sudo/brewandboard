import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import InvestorPage from "@/pages/investor";
import FindBaristasPage from "@/pages/find-baristas";
import FranchisePage from "@/pages/franchise";
import RegionalDashboard from "@/pages/regional";
import VirtualHostPage from "@/pages/virtual-host";
import VirtualOrderPage from "@/pages/virtual-order";
import VendorsPage from "@/pages/vendors";
import MeetingPresentationsPage from "@/pages/meeting-presentations";
import PresentationViewerPage from "@/pages/presentation-viewer";
import PartnerHub from "@/pages/partner";
import OperationsPage from "@/pages/operations";
import VendorMenuPage from "@/pages/vendor-menu";
import OrderHistoryPage from "@/pages/order-history";
import OneOffOrderPage from "@/pages/one-off-order";
import { Footer } from "@/components/Footer";

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
      <Route path="/terms" component={TermsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/investor" component={InvestorPage} />
      <Route path="/find-baristas" component={FindBaristasPage} />
      <Route path="/franchise" component={FranchisePage} />
      <Route path="/regional" component={RegionalDashboard} />
      <Route path="/virtual-host" component={VirtualHostPage} />
      <Route path="/virtual-order/:token" component={VirtualOrderPage} />
      <Route path="/vendors" component={VendorsPage} />
      <Route path="/meeting-presentations" component={MeetingPresentationsPage} />
      <Route path="/presentation/:link" component={PresentationViewerPage} />
      <Route path="/partner" component={PartnerHub} />
      <Route path="/operations" component={OperationsPage} />
      <Route path="/order" component={VendorMenuPage} />
      <Route path="/order/:vendorId" component={VendorMenuPage} />
      <Route path="/order-history" component={OrderHistoryPage} />
      <Route path="/one-off-order" component={OneOffOrderPage} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <FooterWrapper />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
