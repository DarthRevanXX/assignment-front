"use client";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut } from "lucide-react";

export function TaskHeader() {
  const { logout } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks efficiently
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-10 w-10" />}>
            <ThemeToggle />
          </Suspense>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
