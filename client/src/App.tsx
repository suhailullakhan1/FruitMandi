import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Merchants from "@/pages/merchants";
import WeightRecording from "@/pages/weight-recording";
import Billing from "@/pages/billing";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth";

function AuthenticatedRoutes() {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: authAPI.getCurrentUser,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !authData?.user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/merchants" component={Merchants} />
      <Route path="/weight-recording" component={WeightRecording} />
      <Route path="/billing" component={Billing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
