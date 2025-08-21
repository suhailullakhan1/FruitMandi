import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Merchant {
  id: string;
  name: string;
  merchantCode: string;
  address?: string;
  phone: string;
}

interface Fruit {
  id: string;
  name: string;
  currentRate: string;
}

interface BillItem {
  fruitId: string;
  weight: number;
  rate: number;
  amount: number;
}

export default function BillingModal({ open, onOpenChange }: BillingModalProps) {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [items, setItems] = useState<BillItem[]>([{ fruitId: '', weight: 0, rate: 0, amount: 0 }]);
  const [transportDeduction, setTransportDeduction] = useState('0');
  const [commissionDeduction, setCommissionDeduction] = useState('0');
  const [otherDeduction, setOtherDeduction] = useState('0');
  const [customMessage, setCustomMessage] = useState('');
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

  const createBillMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/bills', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      handleReset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bill",
        variant: "destructive",
      });
    }
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = parseFloat(transportDeduction) + parseFloat(commissionDeduction) + parseFloat(otherDeduction);
  const netAmount = subtotal - totalDeductions;

  const addItem = () => {
    setItems([...items, { fruitId: '', weight: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'weight' || field === 'rate') {
      newItems[index].amount = newItems[index].weight * newItems[index].rate;
    }
    
    if (field === 'fruitId') {
      const fruit = fruits.find(f => f.id === value);
      if (fruit) {
        newItems[index].rate = parseFloat(fruit.currentRate);
        newItems[index].amount = newItems[index].weight * newItems[index].rate;
      }
    }
    
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMerchant || items.some(item => !item.fruitId || item.weight <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and ensure all items have valid weights",
        variant: "destructive",
      });
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // 15 days from now

    const billData = {
      merchantId: selectedMerchant,
      subtotal: subtotal.toFixed(2),
      transportDeduction,
      commissionDeduction,
      otherDeduction,
      netAmount: netAmount.toFixed(2),
      customMessage: customMessage || null,
      status: 'pending',
      dueDate: dueDate.toISOString(),
    };

    const billItems = items.map(item => ({
      fruitId: item.fruitId,
      weight: item.weight.toString(),
      rate: item.rate.toFixed(2),
      amount: item.amount.toFixed(2),
    }));

    createBillMutation.mutate({ billData, items: billItems });
  };

  const handleReset = () => {
    setSelectedMerchant('');
    setItems([{ fruitId: '', weight: 0, rate: 0, amount: 0 }]);
    setTransportDeduction('0');
    setCommissionDeduction('0');
    setOtherDeduction('0');
    setCustomMessage('');
  };

  const selectedMerchantData = merchants.find(m => m.id === selectedMerchant);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Bill</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Header */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                  <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Merchant" />
                    </SelectTrigger>
                    <SelectContent>
                      {merchants.map((merchant) => (
                        <SelectItem key={merchant.id} value={merchant.id}>
                          {merchant.name} ({merchant.merchantCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMerchantData && (
                    <div className="text-sm text-gray-600 mt-4">
                      <p>{selectedMerchantData.address || 'No address provided'}</p>
                      <p>{selectedMerchantData.phone}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill No:</span>
                      <span className="font-medium">Auto-generated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">
                        {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fruit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Weight (kg)</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rate/kg</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <Select
                            value={item.fruitId}
                            onValueChange={(value) => updateItem(index, 'fruitId', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select fruit" />
                            </SelectTrigger>
                            <SelectContent>
                              {fruits.map((fruit) => (
                                <SelectItem key={fruit.id} value={fruit.id}>
                                  {fruit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.weight || ''}
                            onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.rate || ''}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card>
            <CardHeader>
              <CardTitle>Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transport">Transport</Label>
                  <Input
                    id="transport"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={transportDeduction}
                    onChange={(e) => setTransportDeduction(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={commissionDeduction}
                    onChange={(e) => setCommissionDeduction(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other">Other</Label>
                  <Input
                    id="other"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={otherDeduction}
                    onChange={(e) => setOtherDeduction(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deductions:</span>
                  <span className="font-medium text-red-600">-₹{totalDeductions.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Net Amount:</span>
                    <span className="font-bold text-gray-900">₹{netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message</Label>
            <Textarea
              id="message"
              placeholder="Add a custom message for this bill..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={createBillMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={createBillMutation.isPending}
            >
              {createBillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Bill'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
