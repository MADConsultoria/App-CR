"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareSession() {
      const supabase = createClient();
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    }

    prepareSession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível definir a senha. Abra novamente o link recebido por e-mail.");
      return;
    }

    router.replace("/cursos");
    router.refresh();
  }

  if (checkingSession) {
    return <p className="accessNote">Validando link...</p>;
  }

  if (!hasSession) {
    return (
      <div className="formError">
        Este link não abriu uma sessão válida. Solicite um novo convite ou envie uma nova recuperação de senha.
      </div>
    );
  }

  return (
    <form className="authForm" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nova senha</span>
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          type="password"
          value={password}
        />
      </label>

      <label className="field">
        <span>Confirmar senha</span>
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Digite novamente"
          required
          type="password"
          value={confirmPassword}
        />
      </label>

      {error ? <p className="formError">{error}</p> : null}

      <button className="primaryButton" disabled={loading} type="submit">
        <span>{loading ? "Salvando..." : "Definir senha"}</span>
        <span className="material-symbols-outlined">check_circle</span>
      </button>
    </form>
  );
}
