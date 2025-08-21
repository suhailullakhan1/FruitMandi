import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Scale, Package, Plus, Minus, Calculator } from "lucide-react";

interface EnhancedWeightModalProps {
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
  variety: string;
  currentRate: string;
  unit: string;
}

interface CrateEntry {
  id: string;
  weight: string;
}

export default function EnhancedWeightModal({ open, onOpenChange }: EnhancedWeightModalProps) {
  const [entryType, setEntryType] = useState<'single' | 'multiple'>('single');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedFruit, setSelectedFruit] = useState('');
  const [weight, setWeight] = useState('');
  const [numberOfCrates, setNumberOfCrates] = useState('');
  const [crateEntries, setCrateEntries] = useState<CrateEntry[]>([{ id: '1', weight: '' }]);
  const [customRate, setCustomRate] = useState('');
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

  const selectedFruitData = fruits.find(f => f.id === selectedFruit);

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
      setCustomRate(fruit.currentRate);
    }
  };

  const addCrateEntry = () => {
    setCrateEntries(prev => [...prev, { id: Date.now().toString(), weight: '' }]);
  };

  const removeCrateEntry = (id: string) => {
    setCrateEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateCrateWeight = (id: string, weight: string) => {
    setCrateEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, weight } : entry
    ));
  };

  const calculateTotalWeight = () => {
    if (entryType === 'single') {
      return parseFloat(weight || '0');
    } else {
      return crateEntries.reduce((total, entry) => total + parseFloat(entry.weight || '0'), 0);
    }
  };

  const calculateAverageWeight = () => {
    if (entryType === 'multiple' && crateEntries.length > 0) {
      const totalWeight = calculateTotalWeight();
      return totalWeight / crateEntries.length;
    }
    return 0;
  };

  const calculateTotalAmount = () => {
    const totalWeight = calculateTotalWeight();
    const rate = parseFloat(customRate || '0');
    return totalWeight * rate;
  };

  const handleSubmit = () => {
    if (!selectedMerchant || !selectedFruit || calculateTotalWeight() <= 0 || !customRate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      merchantId: selectedMerchant,
      fruitId: selectedFruit,
      entryType,
      weight: calculateTotalWeight().toString(),
      numberOfCrates: entryType === 'multiple' ? crateEntries.length : null,
      averageWeightPerCrate: entryType === 'multiple' ? calculateAverageWeight().toString() : null,
      rate: customRate,
      totalAmount: calculateTotalAmount().toString(),
      notes,
    };

    createWeightEntryMutation.mutate(data);
  };

  const handleReset = () => {
    setEntryType('single');
    setSelectedMerchant('');
    setSelectedFruit('');
    setWeight('');
    setNumberOfCrates('');
    setCrateEntries([{ id: '1', weight: '' }]);
    setCustomRate('');
    setNotes('');
  };

  const isLoading = createWeightEntryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-600" />
            Record Weight Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entry Type Selection */}
          <Tabs value={entryType} onValueChange={(value) => setEntryType(value as 'single' | 'multiple')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Single Tonnage
              </TabsTrigger>
              <TabsTrigger value="multiple" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Multiple Crates
              </TabsTrigger>
            </TabsList>

            {/* Merchant Selection */}
            <div className="space-y-2 mt-4">
              <Label>Merchant</Label>
              <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select merchant" />
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

            {/* Fruit Selection */}
            <div className="space-y-2">
              <Label>Fruit</Label>
              <Select value={selectedFruit} onValueChange={handleFruitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fruit" />
                </SelectTrigger>
                <SelectContent>
                  {fruits.map((fruit) => (
                    <SelectItem key={fruit.id} value={fruit.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{fruit.name}</span>
                        {fruit.variety && (
                          <Badge variant="secondary" className="ml-2">
                            {fruit.variety}
                          </Badge>
                        )}
                        <span className="ml-auto text-sm text-muted-foreground">
                          ₹{fruit.currentRate}/{fruit.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight Entry Sections */}
            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Single Tonnage Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Total Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Enter total weight"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="multiple">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Multiple Crates Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Crate Weights (kg)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addCrateEntry}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Crate
                      </Button>
                    </div>
                    
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {crateEntries.map((entry, index) => (
                        <div key={entry.id} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-16">
                            Crate {index + 1}:
                          </span>
                          <Input
                            type="number"
                            step="0.001"
                            value={entry.weight}
                            onChange={(e) => updateCrateWeight(entry.id, e.target.value)}
                            placeholder="Weight"
                            className="flex-1"
                          />
                          {crateEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCrateEntry(entry.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Number of Crates:</span>
                        <span className="font-medium">{crateEntries.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Weight:</span>
                        <span className="font-medium">{calculateTotalWeight().toFixed(3)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average per Crate:</span>
                        <span className="font-medium">{calculateAverageWeight().toFixed(3)} kg</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rate and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rate per kg (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  placeholder="Rate per kg"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold text-green-600">
                    ₹{calculateTotalAmount().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            {/* Summary Card */}
            {selectedFruitData && calculateTotalWeight() > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-green-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Fruit:</span> {selectedFruitData.name}
                      {selectedFruitData.variety && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {selectedFruitData.variety}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Entry Type:</span> {entryType === 'single' ? 'Single Tonnage' : 'Multiple Crates'}
                    </div>
                    <div>
                      <span className="font-medium">Total Weight:</span> {calculateTotalWeight().toFixed(3)} kg
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> ₹{customRate}/kg
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
                Reset
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? "Recording..." : "Record Entry"}
              </Button>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}