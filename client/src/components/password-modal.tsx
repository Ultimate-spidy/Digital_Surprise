import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slug: string;
}

export default function PasswordModal({ open, onClose, onSuccess, slug }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', `/api/surprises/${slug}/verify-password`, {
        password,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password correct! 🎉",
        description: "Revealing your surprise...",
      });
      onSuccess();
      setPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Incorrect password",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }
    verifyPasswordMutation.mutate(password);
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="celebration-card border-0 max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <DialogTitle className="text-2xl font-bold gradient-text mb-2">
              Protected Surprise!
            </DialogTitle>
            <p className="text-muted-foreground">Enter the password to reveal your surprise</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="password-input text-center text-lg"
              autoFocus
              disabled={verifyPasswordMutation.isPending}
              data-testid="password-modal-input"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={verifyPasswordMutation.isPending}
              data-testid="unlock-button"
            >
              <Key className="w-4 h-4 mr-2" />
              {verifyPasswordMutation.isPending ? "Verifying..." : "Unlock"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={verifyPasswordMutation.isPending}
              data-testid="close-modal-button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
