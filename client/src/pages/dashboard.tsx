import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Coffee, 
  MapPin, 
  ChevronRight,
  Star,
  Plus,
  Download,
  Users,
  Calendar,
  Scan,
  Code2,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { COFFEE_SHOPS, TEAM_MEMBERS } from "@/lib/mock-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Web3Search } from "@/components/Web3Search";

export default function Dashboard() {
  const userName = localStorage.getItem("user_name") || "Only";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate "Add to Home Screen" prompt
    const hasSeenPrompt = localStorage.getItem("has_seen_install_prompt");
    if (!hasSeenPrompt) {
      setTimeout(() => {
        toast({
          title: "Install App",
          description: "Add Coffee Talk to your home screen for quick access.",
          action: (
            <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={() => console.log("Install clicked")}>
              <Download className="h-4 w-4" /> Install
            </Button>
          ),
          duration: 6000,
        });
        localStorage.setItem("has_seen_install_prompt", "true");
      }, 2000);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold tracking-tight">Coffee Talk</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">Good Morning, {userName}</span>
            <Avatar className="h-8 w-8 ring-2 ring-primary/10 cursor-pointer" onClick={() => setLocation("/")}>
              <AvatarFallback className="bg-primary text-primary-foreground">O</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Web3 Research Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium">Web3 Research</span>
            <span className="text-muted-foreground/60">• Search tokens, contracts, URLs</span>
          </div>
          <Web3Search />
        </motion.div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Weather Widget - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group h-32"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Nashville, TN</span>
              </div>
              <div className="text-3xl font-serif font-medium">64°</div>
              <div className="text-xs text-muted-foreground mt-1">Partly Cloudy</div>
            </div>
            {/* Removed weather icon as requested to save space/avoid clutter */}
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
               <div className="w-24 h-24 rounded-full bg-amber-500 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Quick Action - Portfolio */}
          <Link href="/portfolio">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-700 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">My Portfolio</h3>
                <p className="text-white/60 text-[10px]">Client notes & templates</p>
              </div>
            </motion.div>
          </Link>

          {/* Quick Action - Order */}
          <Link href="/schedule">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">Schedule Order</h3>
                <p className="text-primary-foreground/60 text-[10px]">Coffee delivery</p>
              </div>
            </motion.div>
          </Link>

          {/* Quick Action - Document Scanner */}
          <Link href="/scan">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
              data-testid="button-scan-documents"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Scan className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">Scan Document</h3>
                <p className="text-white/60 text-[10px]">Create & share PDFs</p>
              </div>
            </motion.div>
          </Link>

          {/* Developer Hub */}
          <Link href="/developers">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32 relative overflow-hidden shine-effect"
              data-testid="button-developers"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2 relative z-10">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="relative z-10">
                <h3 className="font-serif text-md leading-none mb-1 flex items-center gap-1">
                  Developer Hub
                  <Sparkles className="h-3 w-3" />
                </h3>
                <p className="text-white/60 text-[10px]">API & integrations</p>
              </div>
            </motion.div>
          </Link>

          {/* Team Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 lg:col-span-4 bg-card border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg">Team Members</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs">Manage Team</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.id} className="flex flex-col items-center text-center space-y-2 group cursor-pointer">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:ring-2 ring-primary/20 transition-all">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium truncate w-20">{member.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate w-20">{member.role}</div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">Add New</div>
              </div>
            </div>
          </motion.div>

          {/* Recent Vendors Scroll */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3 lg:col-span-4"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-serif text-lg">Curated Roasters</h3>
              <span className="text-xs font-medium text-muted-foreground hover:text-primary cursor-pointer">View All</span>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
              <div className="flex w-max space-x-4 pb-4">
                {COFFEE_SHOPS.map((shop) => (
                  <div 
                    key={shop.id} 
                    className="w-[280px] h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img 
                      src={shop.image} 
                      alt={shop.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none text-xs">{shop.rating} <Star className="h-3 w-3 ml-1 fill-current" /></Badge>
                        {shop.id === 'crema' && <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">Trending</Badge>}
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-1">{shop.name}</h3>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {shop.location}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs text-white/80">{shop.specialty}</span>
                        <Button size="sm" className="h-8 bg-white text-black hover:bg-white/90 font-medium">View Menu</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
