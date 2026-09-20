import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

const signInAction = vi.fn();
vi.mock("@/features/auth/actions", () => ({
  signInAction: (...args: unknown[]) => signInAction(...args),
}));

const { LoginForm } = await import("@/features/auth/login-form");

describe("LoginForm", () => {
  it("shows validation errors instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(signInAction).not.toHaveBeenCalled();
  });

  it("submits valid credentials and redirects on success", async () => {
    signInAction.mockResolvedValueOnce({});
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "ana@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInAction).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: "secret123",
      });
    });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/app/dashboard"));
  });

  it("shows the server error message and does not redirect on failure", async () => {
    signInAction.mockResolvedValueOnce({
      error: "Your email or password is incorrect.",
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "ana@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/email or password is incorrect/i),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
