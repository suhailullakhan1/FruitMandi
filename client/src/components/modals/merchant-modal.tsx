import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface MerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MerchantModal({ open, onOpenChange }: MerchantModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [commissionRate, setCommissionRate] = useState('5.00');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMerchantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/merchants', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Merchant created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/merchants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      handleReset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create merchant",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive",
      });
      return;
    }

    const merchantCode = `M${Date.now().toString().slice(-6)}`;

    createMerchantMutation.mutate({
      merchantCode,
      name,
      phone,
      address: address || null,
      commissionRate,
      isActive: true,
    });
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setAddress('');
    setCommissionRate('5.00');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Merchant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Merchant Name *</Label>
            <Input
              id="name"
              placeholder="Enter merchant name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter merchant address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission Rate (%)</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMerchantMutation.isPending}
            >
              {createMerchantMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Merchant'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
