import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import EnhancedWeightModal from "@/components/modals/enhanced-weight-modal";
import { Search, Plus, Scale, Calendar } from "lucide-react";

interface WeightEntry {
  id: string;
  merchant?: {
    name: string;
    merchantCode: string;
  };
  fruit?: {
    name: string;
    variety?: string;
  };
  entryType?: string;
  weight: string;
  numberOfCrates?: number;
  averageWeightPerCrate?: string;
  rate: string;
  totalAmount: string;
  recordedBy?: {
    name: string;
  };
  notes?: string;
  createdAt: string;
}

export default function WeightRecording() {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: entries = [], isLoading } = useQuery<WeightEntry[]>({
    queryKey: ['/api/weight-entries'],
  });

  const filteredEntries = entries.filter(entry =>
    entry.merchant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.merchant?.merchantCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.fruit?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex lg:w-64" />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-0 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Weight Recording</h1>
              <p className="text-gray-600">Record and track weight entries</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Button onClick={() => setShowWeightModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Record Weight
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-6">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by merchant name, code, or fruit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Weight Entries */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-center mt-2 text-gray-600">Loading weight entries...</p>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No entries found' : 'No weight entries yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by recording your first weight entry'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowWeightModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record First Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Weight Entries ({filteredEntries.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Merchant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fruit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weight
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate/kg
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recorded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-600">
                                  {entry.merchant?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{entry.merchant?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{entry.merchant?.merchantCode || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <Badge variant="outline">{entry.fruit?.name || 'Unknown'}</Badge>
                              {entry.fruit?.variety && (
                                <span className="text-xs text-gray-500 mt-1">{entry.fruit.variety}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{parseFloat(entry.weight).toFixed(2)} kg</span>
                              {entry.entryType === 'multiple' && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>{entry.numberOfCrates} crates</span>
                                  <br />
                                  <span>Avg: {parseFloat(entry.averageWeightPerCrate || '0').toFixed(2)} kg/crate</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(entry.rate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(entry.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.recordedBy?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modal */}
      <EnhancedWeightModal open={showWeightModal} onOpenChange={setShowWeightModal} />
    </div>
  );
}
