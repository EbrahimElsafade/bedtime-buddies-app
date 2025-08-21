
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PasswordResetFormProps {
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

export const PasswordResetForm = ({ onSubmit, onCancel }: PasswordResetFormProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(resetEmail);
      onCancel();
      setResetEmail("");
    } catch (err) {
      // Error is handled by onSubmit function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail">Email</Label>
          <Input
            id="resetEmail"
            type="email"
            placeholder="hello@example.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-dream-DEFAULT hover:bg-dream-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Instructions"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
