
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterStepOneProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onNext: () => void;
  error: string;
}

export const RegisterStepOne = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  onNext,
  error
}: RegisterStepOneProps) => {
  const handleNext = () => {
    if (!name || !email || !password) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="John Smith"
          required
          aria-describedby={error ? "error-message" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="hello@example.com"
          required
          aria-describedby={error ? "error-message" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          aria-describedby="password-help"
        />
        <p id="password-help" className="text-xs text-muted-foreground">
          Password must be at least 6 characters
        </p>
      </div>

      {error && (
        <p id="error-message" className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        className="bg-dream-DEFAULT w-full hover:bg-dream-dark"
        onClick={handleNext}
      >
        Next
      </Button>
    </div>
  );
};
