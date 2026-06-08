"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);

    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/definir-senha`
    });

    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o e-mail de recuperação. Confira o endereço e tente novamente.");
      return;
    }

    setSent(true);
  }

  return (
    <form className="authForm" onSubmit={handleSubmit}>
      <label className="field">
        <span>E-mail</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          required
          type="email"
          value={email}
        />
      </label>

      {sent ? (
        <div className="savedNotice">
          Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </div>
      ) : null}

      {error ? <p className="formError">{error}</p> : null}

      <button className="primaryButton" disabled={loading} type="submit">
        <span>{loading ? "Enviando..." : "Enviar link de recuperação"}</span>
        <span className="material-symbols-outlined">outgoing_mail</span>
      </button>
    </form>
  );
}
