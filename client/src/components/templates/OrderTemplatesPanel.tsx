import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Bookmark, 
  Plus, 
  Clock, 
  Coffee, 
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface OrderTemplate {
  id: number;
  name: string;
  vendorId: number;
  vendorName: string;
  items: { name: string; quantity: number; price: number }[];
  headcount: number;
  totalEstimate: number;
  createdAt: string;
  usageCount: number;
}

export function OrderTemplatesPanel({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);
  const [newName, setNewName] = useState("");

  const { data: templates = [], isLoading } = useQuery<OrderTemplate[]>({
    queryKey: ["/api/order-templates", userId],
    queryFn: async () => {
      const res = await fetch(`/api/order-templates/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await fetch(`/api/order-templates/${templateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Template deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/order-templates"] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`/api/order-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Template renamed" });
      queryClient.invalidateQueries({ queryKey: ["/api/order-templates"] });
      setEditingTemplate(null);
    },
  });

  const handleRename = () => {
    if (editingTemplate && newName.trim()) {
      renameMutation.mutate({ id: editingTemplate.id, name: newName.trim() });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-blue-500 animate-pulse" />
          <h3 className="font-serif text-lg">Loading Templates...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!templates.length) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20 text-center">
        <Bookmark className="h-12 w-12 mx-auto mb-3 text-blue-400/40" />
        <h3 className="font-serif text-lg mb-2">No Saved Templates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save your go-to orders as templates for instant reordering
        </p>
        <Link href="/schedule">
          <Button 
            variant="outline"
            className="border-blue-500/30 hover:bg-blue-500/10 text-blue-600"
            data-testid="button-create-first-template"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
      <div className="p-4 border-b border-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-500" />
            <h3 className="font-serif text-lg">Order Templates</h3>
            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">
              {templates.length}
            </Badge>
          </div>
          <Link href="/schedule?createTemplate=true">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1 text-blue-600"
              data-testid="button-new-template"
            >
              <Plus className="h-3 w-3" /> New
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="p-3 space-y-3">
          <AnimatePresence>
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="bg-card border rounded-xl p-3 hover:shadow-md transition-all hover:border-blue-500/30">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.vendorName}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingTemplate(template);
                          setNewName(template.name);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {template.items.slice(0, 3).map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {item.quantity}x {item.name}
                      </Badge>
                    ))}
                    {template.items.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{template.items.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {template.headcount} people
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Used {template.usageCount}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#5c4033]">
                        ~${template.totalEstimate.toFixed(0)}
                      </span>
                      <Link href={`/schedule?template=${template.id}`}>
                        <Button
                          size="sm"
                          className="h-7 text-xs text-white shine-effect"
                          style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                          data-testid={`button-use-template-${template.id}`}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Rename Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Template name"
              data-testid="input-template-name"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRename}
                disabled={!newName.trim() || renameMutation.isPending}
                className="shine-effect"
                style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                data-testid="button-save-template-name"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
