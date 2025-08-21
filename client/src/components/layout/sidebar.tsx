import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth";
import { useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Scale, 
  File, 
  BarChart3, 
  Settings, 
  LogOut,
  Sprout
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Merchants', href: '/merchants', icon: Users },
  { name: 'Weight Recording', href: '/weight-recording', icon: Scale },
  { name: 'Billing', href: '/billing', icon: File },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: authAPI.getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.clear();
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
          <Sprout className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">FruitTrade Pro</h1>
          <p className="text-sm text-gray-500 capitalize">
            {authData?.user?.role || 'User'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => setLocation(item.href)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
