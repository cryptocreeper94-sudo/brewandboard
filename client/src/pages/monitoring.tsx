import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AdminDashboard from "@/components/admin-dashboard";

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="bg-gradient-to-r from-[#1a0f09] to-[#5a3620] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/developers">
            <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="button-back-developers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Developer Hub
            </Button>
          </Link>
          <h1 className="text-xl font-bold">System Monitoring</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6">
        <AdminDashboard />
      </main>
    </div>
  );
}
