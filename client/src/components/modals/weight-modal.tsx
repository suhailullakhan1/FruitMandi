import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface WeightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Merchant {
  id: string;
  name: string;
  merchantCode: string;
}

interface Fruit {
  id: string;
  name: string;
  currentRate: string;
}

export default function WeightModal({ open, onOpenChange }: WeightModalProps) {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedFruit, setSelectedFruit] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: merchants = [] } = useQuery<Merchant[]>({
    queryKey: ['/api/merchants'],
    enabled: open,
  });

  const { data: fruits = [] } = useQuery<Fruit[]>({
    queryKey: ['/api/fruits'],
    enabled: open,
  });

  const createWeightEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/weight-entries', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weight entry recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/weight-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      handleReset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record weight entry",
        variant: "destructive",
      });
    }
  });

  const handleFruitChange = (fruitId: string) => {
    setSelectedFruit(fruitId);
    const fruit = fruits.find(f => f.id === fruitId);
    if (fruit) {
      setRate(fruit.currentRate);
    }
  };

  const totalAmount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(2) : '0.00';
  const commission = totalAmount ? (parseFloat(totalAmount) * 0.05).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMerchant || !selectedFruit || !weight || !rate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createWeightEntryMutation.mutate({
      merchantId: selectedMerchant,
      fruitId: selectedFruit,
      weight: parseFloat(weight),
      rate: parseFloat(rate),
      totalAmount: parseFloat(totalAmount),
      notes: notes || null,
    });
  };

  const handleReset = () => {
    setSelectedMerchant('');
    setSelectedFruit('');
    setWeight('');
    setRate('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Weight</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="merchant">Select Merchant *</Label>
              <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name} ({merchant.merchantCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fruit">Fruit Type *</Label>
              <Select value={selectedFruit} onValueChange={handleFruitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Fruit" />
                </SelectTrigger>
                <SelectContent>
                  {fruits.map((fruit) => (
                    <SelectItem key={fruit.id} value={fruit.id}>
                      {fruit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate per kg *</Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                <span className="text-lg font-bold text-gray-900">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Commission (5%):</span>
                <span className="text-sm text-gray-600">₹{commission}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
              disabled={createWeightEntryMutation.isPending}
            >
              {createWeightEntryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Weight'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
