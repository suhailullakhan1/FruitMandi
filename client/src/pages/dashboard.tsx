import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import WeightModal from "@/components/modals/weight-modal";
import BillingModal from "@/components/modals/billing-modal";
import MerchantModal from "@/components/modals/merchant-modal";
import { useState } from "react";
import { 
  Users, 
  IndianRupee, 
  Scale, 
  File, 
  Plus, 
  UserPlus, 
  BarChart3, 
  Download,
  Eye,
  Printer
} from "lucide-react";

interface DashboardStats {
  merchantCount: number;
  todayRevenue: string;
  totalWeight: string;
  transactionCount: number;
}

interface Transaction {
  id: string;
  merchant: {
    name: string;
    code: string;
  };
  fruit: {
    name: string;
  };
  weight: string;
  amount: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/weight-entries'],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const quickActions = [
    {
      title: "Record Weight",
      description: "Add new weight entry",
      icon: Plus,
      action: () => setShowWeightModal(true),
      color: "bg-blue-100 text-primary",
    },
    {
      title: "Generate Bill",
      description: "Create new invoice",
      icon: File,
      action: () => setShowBillingModal(true),
      color: "bg-green-100 text-secondary",
    },
    {
      title: "Add Merchant",
      description: "Register new merchant",
      icon: UserPlus,
      action: () => setShowMerchantModal(true),
      color: "bg-yellow-100 text-accent",
    },
    {
      title: "View Reports",
      description: "Analytics & insights",
      icon: BarChart3,
      action: () => {},
      color: "bg-purple-100 text-purple-600",
    },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setShowWeightModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-secondary">
                    +12%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {statsLoading ? "..." : stats?.merchantCount || 0}
                </h3>
                <p className="text-gray-600 text-sm">Active Merchants</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-secondary" />
                  </div>
                  <Badge variant="secondary" className="text-secondary">
                    +8%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {statsLoading ? "..." : formatCurrency(stats?.todayRevenue || '0')}
                </h3>
                <p className="text-gray-600 text-sm">Today's Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Scale className="h-6 w-6 text-accent" />
                  </div>
                  <Badge variant="secondary" className="text-secondary">
                    +15%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {statsLoading ? "..." : `${parseFloat(stats?.totalWeight || '0').toFixed(0)} kg`}
                </h3>
                <p className="text-gray-600 text-sm">Total Weight Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <File className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="text-secondary">
                    +22%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {statsLoading ? "..." : stats?.transactionCount || 0}
                </h3>
                <p className="text-gray-600 text-sm">Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fruit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-600">
                                  {transaction.merchant.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{transaction.merchant.name}</p>
                                <p className="text-sm text-gray-500">{transaction.merchant.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.fruit.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.weight} kg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <WeightModal open={showWeightModal} onOpenChange={setShowWeightModal} />
      <BillingModal open={showBillingModal} onOpenChange={setShowBillingModal} />
      <MerchantModal open={showMerchantModal} onOpenChange={setShowMerchantModal} />
    </div>
  );
}
