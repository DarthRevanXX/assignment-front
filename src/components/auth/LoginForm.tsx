"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

export function LoginForm() {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    shouldFocusError: false,
    mode: "onSubmit",
  });

  const handleInputChange = (currentValue: string, fieldName: string) => {
    if (loginError && !form.formState.isSubmitting) {
      const defaultValue = form.formState.defaultValues?.[fieldName as keyof LoginFormData] || "";
      if (currentValue !== defaultValue) {
        setLoginError(null);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionExpired = sessionStorage.getItem("session_expired");
      if (sessionExpired === "true") {
        toast.warning("Session Expired", {
          description: "Your session has expired. Please sign in again.",
        });
        sessionStorage.removeItem("session_expired");
      }
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    // Clear previous errors
    setLoginError(null);

    try {
      const result = await login(data);

      if (!result.success) {
        const errorMessage = result.error || "Login failed";
        setLoginError(errorMessage);

        toast.error("Login Failed", {
          description: errorMessage,
          duration: 5000,
        });
      } else {
        toast.success("Login Successful", {
          description: "Redirecting to tasks...",
        });
      }
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);

      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
          <CardDescription>
            Sign in to your account to manage your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleInputChange(e.target.value, "username");
                        }}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleInputChange(e.target.value, "password");
                        }}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
