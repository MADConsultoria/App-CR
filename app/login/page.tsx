import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="authPage">
      <section className="authBrandPanel">
        <div className="brandMark">
          <img alt="CR Mentoria" src="/assets/cr-mentoria-logo.png" />
        </div>
        <div>
          <p className="eyebrow">Mentoria de construcao e crescimento</p>
          <h1>Construa, acompanhe e venda com processo.</h1>
          <p>
            Acesse suas trilhas, aulas e materiais de apoio em um ambiente privado para alunos.
          </p>
        </div>
      </section>

      <section className="authPanel" aria-labelledby="login-title">
        <div className="authHeader">
          <p className="eyebrow">Acesso restrito</p>
          <h2 id="login-title">Entrar na plataforma</h2>
          <p>Use o e-mail cadastrado para continuar sua trilha.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="accessNote">
          Ainda não tem acesso? Solicite liberação com a equipe responsável.
        </p>
      </section>
    </main>
  );
}
