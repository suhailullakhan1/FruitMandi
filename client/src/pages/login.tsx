import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sprout } from "lucide-react";

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendOTPMutation = useMutation({
    mutationFn: ({ phone, role }: { phone: string; role: string }) => authAPI.sendOTP(phone, role),
    onSuccess: () => {
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
  });

  const verifyOTPMutation = useMutation({
    mutationFn: ({ phone, otp, role, name }: { phone: string; otp: string; role: string; name?: string }) => 
      authAPI.verifyOTP(phone, otp, role, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Login Successful",
        description: "Welcome to FruitTrade Pro!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    }
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (role === 'merchant' && !name.trim()) {
      toast({
        title: "Error",
        description: "Name is required for merchants",
        variant: "destructive",
      });
      return;
    }
    sendOTPMutation.mutate({ phone, role });
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOTPMutation.mutate({ phone, otp, role, name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">FruitTrade Pro</CardTitle>
          <CardDescription>
            {step === 'phone' ? 'Sign in to your account' : `Enter OTP sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="writer">Writer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {role === 'merchant' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={sendOTPMutation.isPending}
              >
                {sendOTPMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-sm text-center text-gray-600 mt-2">
                    Demo OTP: 123456
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={verifyOTPMutation.isPending}
                >
                  {verifyOTPMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
              </form>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Back to Phone Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
