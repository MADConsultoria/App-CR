import { SetPasswordForm } from "./set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="authPage">
      <section className="authBrandPanel">
        <div className="brandMark">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </div>
        <div>
          <p className="eyebrow">Convite de acesso</p>
          <h1>Defina sua senha para começar.</h1>
          <p>Use o link enviado por e-mail para ativar seu acesso à plataforma.</p>
        </div>
      </section>

      <section className="authPanel" aria-labelledby="set-password-title">
        <div className="authHeader">
          <p className="eyebrow">Supabase Auth</p>
          <h2 id="set-password-title">Criar senha</h2>
          <p>Escolha uma senha segura para entrar nas próximas vezes.</p>
        </div>
        <SetPasswordForm />
      </section>
    </main>
  );
}
