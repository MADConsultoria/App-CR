import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="authPage">
      <section className="authBrandPanel">
        <div className="brandMark">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </div>
        <div>
          <p className="eyebrow">Recuperação de acesso</p>
          <h1>Receba um link para redefinir sua senha.</h1>
          <p>Informe o e-mail cadastrado na plataforma para continuar com segurança.</p>
        </div>
      </section>

      <section className="authPanel" aria-labelledby="reset-password-title">
        <div className="authHeader">
          <p className="eyebrow">Supabase Auth</p>
          <h2 id="reset-password-title">Esqueci minha senha</h2>
          <p>Enviaremos um link para você criar uma nova senha.</p>
        </div>
        <ResetPasswordForm />
        <p className="accessNote">
          Lembrou a senha? <Link href="/login">Voltar para o login</Link>.
        </p>
      </section>
    </main>
  );
}
