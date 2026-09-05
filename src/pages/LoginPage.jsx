import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getLoginErrorMessage } from "../utils/feedback";
import { navigate } from "../utils/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="sidebar-kicker">Contour Education</p>
        <h1>Parent Feedback</h1>
        <p className="login-copy">
          Sign in with your staff account to review parent feedback.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M3.3 2.3 2 3.6l3.1 3.1C3.2 8.2 2 10.2 2 12s4 7 10 7c2.1 0 4-.6 5.6-1.5l3.1 3.1 1.3-1.3L3.3 2.3zM12 17c-4.4 0-7.3-4-8.2-5 .6-.8 1.7-2 3.2-2.9l1.8 1.8A5 5 0 0 0 12 17zm8.2-5c-.4.6-1.1 1.5-2.1 2.3l-1.5-1.5c.2-.5.4-1 .4-1.8A5 5 0 0 0 12 7c-.6 0-1.2.1-1.7.3L8.7 5.7C9.7 5.3 10.8 5 12 5c6 0 10 7 10 7s-.8 1.5-1.8 2.6z"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 5c-6 0-10 7-10 7s4 7 10 7 10-7 10-7-4-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5A2.5 2.5 0 1 0 12 9.5a2.5 2.5 0 0 0 0 5z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {error && (
          <p className="form-message is-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
