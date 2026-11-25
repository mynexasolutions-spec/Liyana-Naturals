export type AuthAction = "login" | "register" | "reset" | "password";

type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
};

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const candidate = error as AuthErrorLike;
    return candidate.message ?? candidate.code ?? "";
  }
  return "";
}

export function getAuthErrorMessage(error: unknown, action: AuthAction): string {
  const rawMessage = errorText(error);
  const message = rawMessage.toLowerCase();

  if (
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("over_email_send_rate_limit")
  ) {
    return "Email delivery is temporarily rate-limited. Wait a few minutes before trying again. If you already registered, use Login instead.";
  }

  if (message.includes("email not confirmed")) {
    return "Please confirm your email from the verification message before signing in.";
  }

  if (
    action === "register" &&
    (message.includes("already registered") || message.includes("already exists"))
  ) {
    return "An account with this email already exists. Use Login or Forgot Password.";
  }

  if (
    action === "login" &&
    (message.includes("invalid login credentials") || message.includes("invalid credentials"))
  ) {
    return "The email or password is incorrect. Check both and try again.";
  }

  if (message.includes("password") && message.includes("weak")) {
    return "Choose a stronger password with at least 8 characters.";
  }

  if (action === "reset" && message.includes("user not found")) {
    return "We could not find an account for that email address.";
  }

  if (rawMessage) return rawMessage;

  return action === "register"
    ? "Unable to create your account. Please try again."
    : action === "reset"
      ? "Unable to send the password reset email. Please try again."
      : action === "password"
        ? "Unable to update your password. Please try again."
        : "Unable to sign in. Please try again.";
}
