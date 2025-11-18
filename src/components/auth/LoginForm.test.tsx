/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { render } from "@/test/utils";
import * as useAuthModule from "@/hooks/useAuth";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth");

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("LoginForm", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    // Mock useAuth to return our mock login function
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe("Rendering", () => {
    it("should render login form elements", () => {
      render(<LoginForm />);

      expect(screen.getByText("Task Manager")).toBeInTheDocument();
      expect(
        screen.getByText("Sign in to your account to manage your tasks")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should have proper input attributes", () => {
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute("placeholder", "Enter your username");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");
    });
  });

  describe("Form Validation", () => {
    it("should not accept whitespace-only inputs", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "   ");
      await user.type(passwordInput, "   ");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Username cannot be only whitespace")
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText("Password cannot be only whitespace")
        ).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("Login Flow", () => {
    it("should login successfully with valid credentials", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "testpass123");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: "testuser",
          password: "testpass123",
        });
      });
    });

    it("should show error message on login failure", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "wronguser");
      await user.type(passwordInput, "wrongpass");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("should show generic error message when error message is not provided", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "testpass");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Login failed")).toBeInTheDocument();
      });
    });

    it("should handle unexpected errors during login", async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error("Network error"));

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "testpass");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("An unexpected error occurred. Please try again.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during login", async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "testpass");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText("Signing in...")).toBeInTheDocument();
      });

      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveLogin!({ success: true });
    });

    it("should re-enable form after failed login", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "testpass");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Form should be enabled again
      expect(usernameInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Session Expiration", () => {
    it("should show session expired warning if flag is set", async () => {
      sessionStorage.setItem("session_expired", "true");

      const { toast } = await import("sonner");

      render(<LoginForm />);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          "Session Expired",
          expect.objectContaining({
            description: "Your session has expired. Please sign in again.",
          })
        );
      });

      // Should clear the flag
      expect(sessionStorage.getItem("session_expired")).toBeNull();
    });

    it("should not show session expired warning if flag is not set", async () => {
      const { toast } = await import("sonner");

      render(<LoginForm />);

      await waitFor(() => {
        expect(toast.warning).not.toHaveBeenCalled();
      });
    });
  });

  describe("Error Clearing", () => {
    it("should clear error message when resubmitting form", async () => {
      const user = userEvent.setup();
      mockLogin
        .mockResolvedValueOnce({
          success: false,
          error: "Invalid credentials",
        })
        .mockResolvedValueOnce({ success: true });

      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // First login attempt (fail)
      await user.type(usernameInput, "wronguser");
      await user.type(passwordInput, "wrongpass");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Clear inputs
      await user.clear(usernameInput);
      await user.clear(passwordInput);

      // Second login attempt (success)
      await user.type(usernameInput, "correctuser");
      await user.type(passwordInput, "correctpass");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
      });
    });
  });
});
