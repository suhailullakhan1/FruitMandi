import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import MerchantModal from "@/components/modals/merchant-modal";
import { Search, UserPlus, Phone, MapPin } from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  merchantCode: string;
  phone: string;
  address?: string;
  commissionRate: string;
  isActive: boolean;
  createdAt: string;
}

export default function Merchants() {
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: merchants = [], isLoading } = useQuery<Merchant[]>({
    queryKey: ['/api/merchants'],
  });

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.merchantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.phone.includes(searchTerm)
  );

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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Merchants</h1>
              <p className="text-gray-600">Manage all registered merchants</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Button onClick={() => setShowMerchantModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Merchant
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
                  placeholder="Search merchants by name, code, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Merchants Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMerchants.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No merchants found' : 'No merchants yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by adding your first merchant'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowMerchantModal(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add First Merchant
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMerchants.map((merchant) => (
                <Card key={merchant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{merchant.name}</CardTitle>
                        <p className="text-sm text-gray-500">{merchant.merchantCode}</p>
                      </div>
                      <Badge variant={merchant.isActive ? "default" : "secondary"}>
                        {merchant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {merchant.phone}
                      </div>
                      {merchant.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{merchant.address}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Commission Rate:</span>
                          <span className="font-medium">{merchant.commissionRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Member since:</span>
                          <span className="font-medium">
                            {new Date(merchant.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <MerchantModal open={showMerchantModal} onOpenChange={setShowMerchantModal} />
    </div>
  );
}
