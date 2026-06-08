"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cursos";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha invalidos. Confira os dados e tente novamente.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form className="authForm" onSubmit={handleSubmit}>
      <label className="field">
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
        />
      </label>

      <div className="formRow">
        <label className="remember">
          <input type="checkbox" />
          <span>Manter conectado</span>
        </label>
        <Link href="/redefinir-senha">Esqueci minha senha</Link>
      </div>

      {error ? <p className="formError">{error}</p> : null}

      <button className="primaryButton" disabled={loading} type="submit">
        <span>{loading ? "Entrando..." : "Entrar na Plataforma"}</span>
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </form>
  );
}
