import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, Calendar, Clock, Package, User, MapPin, Phone } from "lucide-react";
import { generateBillPDF, downloadBillAsPDF } from "@/lib/pdf-generator";

interface BillViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string | null;
}

interface BillDetails {
  id: string;
  billNumber: string;
  merchant: {
    name: string;
    merchantCode: string;
    address?: string;
    phone: string;
  };
  subtotal: string;
  transportDeduction: string;
  commissionDeduction: string;
  otherDeduction: string;
  netAmount: string;
  status: string;
  dueDate: string;
  createdAt: string;
  customMessage?: string;
  items: Array<{
    id: string;
    fruit: {
      name: string;
      unit: string;
    };
    weight: string;
    rate: string;
    amount: string;
  }>;
}

export default function BillViewModal({ open, onOpenChange, billId }: BillViewModalProps) {
  const { data: billDetails, isLoading } = useQuery<BillDetails>({
    queryKey: ['/api/bills', billId],
    enabled: open && !!billId,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary text-white';
      case 'pending':
        return 'bg-accent text-gray-900';
      case 'cancelled':
        return 'bg-destructive text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    if (billDetails) {
      generateBillPDF(billDetails);
    }
  };

  const handleDownload = () => {
    if (billDetails) {
      downloadBillAsPDF(billDetails);
    }
  };

  const handleDownloadPDF = () => {
    if (billDetails) {
      downloadBillAsPDF(billDetails);
    }
  };

  if (!billDetails && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>Bill Details</DialogTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-gray-600">Loading bill details...</p>
          </div>
        ) : billDetails ? (
          <div className="space-y-6 print:space-y-4">
            {/* Bill Header */}
            <div className="bg-white print:bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">FruitTrade Pro</h1>
                  <p className="text-gray-600">Wholesale Fruit Trading</p>
                </div>
                <div className="mt-4 lg:mt-0 text-right">
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-lg font-semibold text-primary">{billDetails.billNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Bill To */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Bill To
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900">{billDetails.merchant.name}</p>
                      <p className="text-sm text-gray-600">{billDetails.merchant.merchantCode}</p>
                      {billDetails.merchant.address && (
                        <div className="flex items-start">
                          <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600">{billDetails.merchant.address}</p>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{billDetails.merchant.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bill Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5 text-primary" />
                      Bill Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(billDetails.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{new Date(billDetails.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(billDetails.status)}>
                          {billDetails.status.charAt(0).toUpperCase() + billDetails.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Payment Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-medium">15 Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">Cash/Bank Transfer</span>
                      </div>
                      {billDetails.status === 'pending' && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          Payment pending - Due {new Date(billDetails.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-primary" />
                  Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase">
                          Weight
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase">
                          Rate/Unit
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {billDetails.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{item.fruit.name}</p>
                            <p className="text-sm text-gray-500">Fresh quality fruits</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-medium">{parseFloat(item.weight).toFixed(2)} {item.fruit.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-medium">{formatCurrency(item.rate)}/{item.fruit.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between">
                  <div className="lg:w-1/2">
                    {billDetails.customMessage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">{billDetails.customMessage}</p>
                      </div>
                    )}
                  </div>
                  <div className="lg:w-1/2 mt-6 lg:mt-0">
                    <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(billDetails.subtotal)}</span>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Transport Deduction:</span>
                          <span className="text-red-600">-{formatCurrency(billDetails.transportDeduction)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Commission Deduction:</span>
                          <span className="text-red-600">-{formatCurrency(billDetails.commissionDeduction)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Other Deduction:</span>
                          <span className="text-red-600">-{formatCurrency(billDetails.otherDeduction)}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-900">Net Amount:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(billDetails.netAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>Thank you for your business!</p>
              <p className="mt-1">For any queries, please contact us at support@fruittradepro.com</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Bill not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}