import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Clock, 
  Users, 
  Coffee, 
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
  ThumbsUp
} from "lucide-react";
import { Link } from "wouter";

interface Recommendation {
  id: string;
  type: "vendor" | "item" | "bundle";
  name: string;
  description: string;
  reason: string;
  confidence: number;
  price?: number;
  image?: string;
  tags: string[];
}

interface MeetingContext {
  headcount?: number;
  timeOfDay?: "morning" | "afternoon" | "evening";
  meetingType?: "team" | "client" | "board" | "casual";
  budget?: number;
}

export function AIRecommendations({ 
  userId,
  context 
}: { 
  userId?: number;
  context?: MeetingContext;
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = () => {
      setLoading(true);
      setTimeout(() => {
        const baseRecs: Recommendation[] = [
          {
            id: "rec-1",
            type: "bundle",
            name: "Morning Kickoff Bundle",
            description: "Coffee, pastries, and fruit for 10",
            reason: "Popular for morning team meetings",
            confidence: 0.92,
            price: 89.99,
            tags: ["Best Seller", "Quick Delivery"]
          },
          {
            id: "rec-2",
            type: "vendor",
            name: "Crema Coffee",
            description: "Award-winning local roaster",
            reason: "Highly rated for client meetings",
            confidence: 0.88,
            tags: ["Premium", "Local Favorite"]
          },
          {
            id: "rec-3",
            type: "item",
            name: "Nashville Breakfast Board",
            description: "Southern-style breakfast spread",
            reason: "Perfect for early meetings",
            confidence: 0.85,
            price: 45.00,
            tags: ["Hot Pick"]
          },
          {
            id: "rec-4",
            type: "bundle",
            name: "Afternoon Energy Pack",
            description: "Cold brews, teas, and snacks",
            reason: "Great for afternoon focus sessions",
            confidence: 0.82,
            price: 65.00,
            tags: ["Trending"]
          }
        ];

        if (context?.timeOfDay === "morning") {
          baseRecs.unshift({
            id: "rec-morning",
            type: "bundle",
            name: "Early Bird Special",
            description: "Hot coffee and fresh pastries",
            reason: "Curated for morning meetings",
            confidence: 0.95,
            price: 55.00,
            tags: ["AI Pick", "Morning"]
          });
        }

        if (context?.headcount && context.headcount > 15) {
          baseRecs.unshift({
            id: "rec-large",
            type: "bundle",
            name: "Large Group Catering",
            description: `Optimized for ${context.headcount} attendees`,
            reason: "Best value for large meetings",
            confidence: 0.94,
            price: context.headcount * 8.5,
            tags: ["Value", "Large Group"]
          });
        }

        setRecommendations(baseRecs.slice(0, 5));
        setLoading(false);
      }, 800);
    };

    generateRecommendations();
  }, [userId, context]);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-purple-500" />
          </motion.div>
          <h3 className="font-serif text-lg">Generating Smart Picks...</h3>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[200px] h-32 bg-muted animate-pulse rounded-lg shrink-0" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20">
      <div className="p-4 border-b border-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-purple-500" />
            </motion.div>
            <h3 className="font-serif text-lg">Smart Picks</h3>
            <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700">
              AI
            </Badge>
          </div>
          <Link href="/schedule?smart=true">
            <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid="link-view-all-recs">
              See All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="pb-4">
        <div className="flex gap-3 p-4">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="shrink-0"
              >
                <Link href={`/schedule?recommendation=${rec.id}`}>
                  <div 
                    className="w-[200px] bg-card border rounded-xl p-3 hover:shadow-lg transition-all hover:border-purple-500/30 cursor-pointer group"
                    data-testid={`card-recommendation-${rec.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {rec.tags.slice(0, 2).map((tag, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className={`text-[9px] px-1.5 py-0 ${
                              tag === "AI Pick" 
                                ? "bg-purple-100 text-purple-700" 
                                : tag === "Best Seller"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted"
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] text-purple-600">
                        <Zap className="h-3 w-3" />
                        {Math.round(rec.confidence * 100)}%
                      </div>
                    </div>

                    <div className="h-12 w-12 rounded-lg mb-2 flex items-center justify-center" 
                      style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                    >
                      {rec.type === "bundle" ? (
                        <TrendingUp className="h-6 w-6 text-white" />
                      ) : rec.type === "vendor" ? (
                        <Star className="h-6 w-6 text-white" />
                      ) : (
                        <Coffee className="h-6 w-6 text-white" />
                      )}
                    </div>

                    <h4 className="font-medium text-sm line-clamp-1 mb-0.5">{rec.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                      {rec.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {rec.price && (
                        <span className="font-semibold text-sm text-[#5c4033]">
                          ${rec.price.toFixed(2)}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{rec.reason.split(" ").slice(0, 3).join(" ")}...</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
