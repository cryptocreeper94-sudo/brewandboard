import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { Product, Shop, ModifierGroup, ModifierOption } from "@/lib/mock-data";
import { SelectedModifier, useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  shop: Shop;
}

export function ItemCustomizationModal({ isOpen, onClose, product, shop }: ItemCustomizationModalProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleModifierChange = (group: ModifierGroup, option: ModifierOption, checked: boolean) => {
    setSelectedModifiers(prev => {
      const current = prev[group.id] || [];
      
      if (group.multiSelect) {
        if (checked) {
          return { ...prev, [group.id]: [...current, option] };
        } else {
          return { ...prev, [group.id]: current.filter(o => o.id !== option.id) };
        }
      } else {
        return { ...prev, [group.id]: checked ? [option] : [] };
      }
    });
  };

  const getModifiersTotal = () => {
    return Object.values(selectedModifiers).flat().reduce((sum, opt) => sum + opt.price, 0);
  };

  const getTotalPrice = () => {
    return (product.price + getModifiersTotal()) * quantity;
  };

  const getMissingRequiredGroups = () => {
    if (!product.modifiers) return [];
    return product.modifiers
      .filter(group => group.required)
      .filter(group => !selectedModifiers[group.id] || selectedModifiers[group.id].length === 0)
      .map(group => group.name);
  };

  const handleAddToCart = () => {
    const missingRequired = getMissingRequiredGroups();
    if (missingRequired.length > 0) {
      toast({
        title: "Required Selection Missing",
        description: `Please select: ${missingRequired.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const modifiersArray: SelectedModifier[] = [];
    
    Object.entries(selectedModifiers).forEach(([groupId, options]) => {
      const group = product.modifiers?.find(m => m.id === groupId);
      if (group) {
        options.forEach(option => {
          modifiersArray.push({
            groupId,
            groupName: group.name,
            option
          });
        });
      }
    });

    for (let i = 0; i < quantity; i++) {
      addItem(shop, product, modifiersArray.length > 0 ? modifiersArray : undefined, specialInstructions || undefined);
    }

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added`,
    });

    // Reset state
    setQuantity(1);
    setSelectedModifiers({});
    setSpecialInstructions('');
    onClose();
  };

  const hasModifiers = product.modifiers && product.modifiers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden bg-gradient-to-br from-[#1a0f09] via-[#2d1810] to-[#1a0f09] border-[#5c4033]/30 shadow-2xl">
        <DialogHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="font-serif text-xl text-stone-100 tracking-wide">
                {product.name}
              </DialogTitle>
              <p className="text-stone-400 text-sm mt-1 leading-relaxed">{product.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 uppercase tracking-wider">Starting at</span>
              <p className="text-[#d4c4b0] font-bold text-lg">${product.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#5c4033]/50 to-transparent mt-3" />
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-5">
            {hasModifiers && product.modifiers?.map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-stone-100 font-medium text-sm tracking-wide">
                      {group.name}
                    </h4>
                    {group.required && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 uppercase tracking-wider">
                        Required
                      </span>
                    )}
                  </div>
                  {group.multiSelect && (
                    <span className="text-[10px] text-stone-400 bg-stone-800/50 px-2 py-0.5 rounded">Choose any</span>
                  )}
                </div>

                {group.multiSelect ? (
                  <div className="space-y-1.5">
                    {group.options.map(option => {
                      const isSelected = (selectedModifiers[group.id] || []).some(o => o.id === option.id);
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#5c4033]/30 border border-[#5c4033]/50 shadow-lg' 
                              : 'bg-black/20 border border-transparent hover:bg-black/30 hover:border-[#5c4033]/20'
                          }`}
                          onClick={() => handleModifierChange(group, option, !isSelected)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`${group.id}-${option.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleModifierChange(group, option, !!checked)}
                              className="border-[#5c4033] data-[state=checked]:bg-[#5c4033] data-[state=checked]:border-[#5c4033]"
                            />
                            <Label
                              htmlFor={`${group.id}-${option.id}`}
                              className={`text-sm cursor-pointer transition-colors ${isSelected ? 'text-stone-100 font-medium' : 'text-stone-300'}`}
                            >
                              {option.name}
                            </Label>
                          </div>
                          {option.price > 0 && (
                            <span className={`text-xs font-medium ${isSelected ? 'text-[#d4c4b0]' : 'text-stone-400'}`}>+${option.price.toFixed(2)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <RadioGroup
                    value={(selectedModifiers[group.id]?.[0]?.id) || ''}
                    onValueChange={(value) => {
                      const option = group.options.find(o => o.id === value);
                      if (option) {
                        handleModifierChange(group, option, true);
                      }
                    }}
                    className="space-y-1.5"
                  >
                    {group.options.map(option => {
                      const isSelected = selectedModifiers[group.id]?.[0]?.id === option.id;
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#5c4033]/30 border border-[#5c4033]/50 shadow-lg' 
                              : 'bg-black/20 border border-transparent hover:bg-black/30 hover:border-[#5c4033]/20'
                          }`}
                          onClick={() => handleModifierChange(group, option, true)}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={option.id}
                              id={`${group.id}-${option.id}`}
                              className="border-[#5c4033] text-[#5c4033]"
                            />
                            <Label
                              htmlFor={`${group.id}-${option.id}`}
                              className={`text-sm cursor-pointer transition-colors ${isSelected ? 'text-stone-100 font-medium' : 'text-stone-300'}`}
                            >
                              {option.name}
                            </Label>
                          </div>
                          {option.price > 0 && (
                            <span className={`text-xs font-medium ${isSelected ? 'text-[#d4c4b0]' : 'text-stone-400'}`}>+${option.price.toFixed(2)}</span>
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-stone-100 text-sm">Special Instructions</Label>
              <Textarea
                placeholder="Any special requests..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="bg-black/20 border-[#3d2418]/50 text-stone-200 placeholder:text-stone-400/50 resize-none"
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-[#5c4033]/30 space-y-4">
          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
            <span className="text-stone-200 text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-9 w-9 p-0 border-[#5c4033] text-[#d4c4b0] hover:bg-[#5c4033]/20 rounded-full"
                data-testid="button-decrease-qty"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-stone-100 font-bold text-lg w-8 text-center">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                className="h-9 w-9 p-0 border-[#5c4033] text-[#d4c4b0] hover:bg-[#5c4033]/20 rounded-full"
                data-testid="button-increase-qty"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Modifiers summary */}
          {getModifiersTotal() > 0 && (
            <div className="text-sm flex justify-between items-center px-1">
              <span className="text-stone-400">Customizations</span>
              <span className="text-[#d4c4b0] font-medium">+${getModifiersTotal().toFixed(2)}</span>
            </div>
          )}

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            className="w-full h-12 text-white font-semibold text-base shine-effect shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
            data-testid="button-add-to-cart-confirm"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart · ${getTotalPrice().toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
