"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveActivitySubmission } from "./actions";

type Question = {
  id: string;
  section_title: string | null;
  label: string;
  help_text: string | null;
  question_key: string;
  question_type: "text" | "long_text" | "number" | "money" | "boolean" | "select" | "location";
  is_required: boolean;
  position: number;
  metadata: Record<string, unknown>;
  answer?: {
    value_text: string | null;
    value_number: number | null;
    value_boolean: boolean | null;
    value_json: Record<string, string> | null;
  };
};

type ActivityFormProps = {
  courseSlug: string;
  lessonId: string;
  activityId: string;
  questions: Question[];
  submissionStatus?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

export function ActivityForm({ courseSlug, lessonId, activityId, questions, submissionStatus }: ActivityFormProps) {
  const isManifesto = questions.some((question) => question.question_key === "assinatura_termo");
  const isLocked = submissionStatus === "submitted" || submissionStatus === "reviewed";
  const [booleanValues, setBooleanValues] = useState<Record<string, boolean | null>>(() => {
    return Object.fromEntries(
      questions
        .filter((question) => question.question_type === "boolean")
        .map((question) => [question.question_key, question.answer?.value_boolean ?? null])
    );
  });

  const groupedQuestions = useMemo(() => {
    return questions.reduce<Record<string, Question[]>>((groups, question) => {
      const section = question.section_title || "Atividade";
      groups[section] = groups[section] || [];
      groups[section].push(question);
      return groups;
    }, {});
  }, [questions]);

  const action = saveActivitySubmission.bind(null, courseSlug, lessonId, activityId);

  if (isManifesto) {
    return (
      <ManifestoForm
        action={action}
        courseSlug={courseSlug}
        isLocked={isLocked}
        lessonId={lessonId}
        questions={questions}
        submissionStatus={submissionStatus}
      />
    );
  }

  function shouldShow(question: Question) {
    const dependsOn = question.metadata?.depends_on;
    if (typeof dependsOn !== "string") {
      return true;
    }

    return booleanValues[dependsOn] === question.metadata?.show_when;
  }

  return (
    <form action={action} className="activityForm">
      {submissionStatus ? <div className="submissionStatus">Status: {translateStatus(submissionStatus)}</div> : null}

      {Object.entries(groupedQuestions).map(([section, sectionQuestions], sectionIndex) => (
        <section className="activitySection" key={section}>
          <div className="activitySectionHeader">
            <span className="activitySectionIcon">
              <span className="material-symbols-outlined">{getSectionIcon(section)}</span>
            </span>
            <div>
              <small>
                Parte {sectionIndex + 1} de {Object.keys(groupedQuestions).length}
              </small>
              <h2>{section}</h2>
            </div>
          </div>
          <div className="activityFields">
            {sectionQuestions.map((question) => {
              if (!shouldShow(question)) {
                return null;
              }

              return (
                <label className="activityField" key={question.id}>
                  <span>
                    {question.label}
                    {question.is_required ? <strong>*</strong> : null}
                  </span>
                  {question.help_text ? <small>{question.help_text}</small> : null}
                  <QuestionInput
                    disabled={isLocked}
                    question={question}
                    onBooleanChange={(value) => {
                      setBooleanValues((current) => ({ ...current, [question.question_key]: value }));
                    }}
                  />
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="activityActions">
        {isLocked ? <span className="lockedSubmission">Respostas enviadas e bloqueadas para edição.</span> : null}
        <Link className="activityBackAction" href={`/cursos/${courseSlug}/aulas/${lessonId}`}>
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar
        </Link>
        <button disabled={isLocked} name="_mode" type="submit" value="draft">
          <span className="material-symbols-outlined">save</span>
          Salvar rascunho
        </button>
        <button className="primary" disabled={isLocked} name="_mode" type="submit" value="submitted">
          Enviar atividade
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}

function ManifestoForm({
  action,
  courseSlug,
  isLocked,
  lessonId,
  questions,
  submissionStatus
}: {
  action: (formData: FormData) => void;
  courseSlug: string;
  isLocked: boolean;
  lessonId: string;
  questions: Question[];
  submissionStatus?: string;
}) {
  const nameQuestion = questions.find((question) => question.question_key === "nome_completo");
  const localQuestion = questions.find((question) => question.question_key === "local_assinatura");
  const dateQuestion = questions.find((question) => question.question_key === "data_assinatura");
  const signatureQuestion = questions.find((question) => question.question_key === "assinatura_termo");
  const [name, setName] = useState(nameQuestion?.answer?.value_text || "");

  return (
    <form action={action} className="manifestForm">
      {submissionStatus ? <div className="submissionStatus">Status: {translateStatus(submissionStatus)}</div> : null}

      <article className="manifestPaper">
        <header>
          <h2>Termo de Compromisso</h2>
          <p>Mentoria Construtores de Riqueza</p>
        </header>

        <div className="manifestText">
          <p>
            Eu,{" "}
            {nameQuestion ? (
              <input
                aria-label="Nome completo"
                className="inlineNameInput"
                defaultValue={name}
                disabled={isLocked}
                name={nameQuestion.id}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite seu nome completo"
                required={nameQuestion.is_required}
                type="text"
              />
            ) : (
              <strong>______________________________</strong>
            )}
            , declaro que, neste momento, estou dando um passo importante na construção do meu futuro.
          </p>

          <p>
            Ao ingressar na Mentoria Construtores de Riqueza, compreendo que não estou apenas adquirindo conhecimento
            sobre construção civil, crédito imobiliário ou investimentos. Estou assumindo o compromisso de me tornar
            uma pessoa capaz de transformar oportunidades em patrimônio, conhecimento em ação e projetos em resultados
            concretos.
          </p>

          <p>
            Reconheço que muitos sonham em construir riqueza, mas poucos estão dispostos a assumir a responsabilidade
            necessária para torná-la realidade. Hoje, escolho fazer parte desse grupo.
          </p>

          <h3>1. Compromisso com a Presença</h3>
          <p>
            Comprometo-me a estar presente física e mentalmente nos encontros, atividades e desafios propostos pela
            mentoria. Não participarei como espectador. Participarei como alguém que está construindo seu futuro.
          </p>

          <h3>2. Compromisso com a Execução</h3>
          <p>
            Reconheço que riqueza não é construída através do conhecimento acumulado, mas através do conhecimento
            aplicado. Comprometo-me a agir, analisar oportunidades, organizar minha documentação, buscar crédito, fazer
            perguntas, tomar decisões e avançar.
          </p>

          <h3>3. Compromisso com a Responsabilidade</h3>
          <p>
            Assumo total responsabilidade pelos resultados do meu projeto. Buscarei orientação quando necessário, mas
            serei protagonista da minha própria jornada.
          </p>

          <h3>4. Compromisso com a Ética e com a Comunidade</h3>
          <p>
            Comprometo-me a agir com honestidade, respeito e profissionalismo, contribuindo para fortalecer o ecossistema
            dos Construtores de Riqueza.
          </p>

          <h3>5. Compromisso com a Conclusão</h3>
          <p>
            Comprometo-me a não abandonar meus objetivos diante das primeiras dificuldades. Toda construção enfrenta
            desafios, mas aqueles que constroem patrimônio continuam avançando apesar deles.
          </p>

          <h3>Declaração Final</h3>
          <p>
            Hoje eu assumo um compromisso que vai além desta mentoria. Assumo um compromisso comigo mesmo. Que esta
            assinatura represente o início de uma nova fase da minha trajetória.
          </p>
        </div>

        <div className="manifestSignatureGrid">
          {localQuestion ? (
            <label>
              <span>Local</span>
              <input
                defaultValue={localQuestion.answer?.value_text || ""}
                disabled={isLocked}
                name={localQuestion.id}
                placeholder="Digite a cidade/local"
                required={localQuestion.is_required}
                type="text"
              />
            </label>
          ) : null}

          {dateQuestion ? (
            <label>
              <span>Data</span>
              <input
                defaultValue={dateQuestion.answer?.value_text || ""}
                disabled={isLocked}
                name={dateQuestion.id}
                placeholder="DD/MM/2026"
                required={dateQuestion.is_required}
                type="text"
              />
            </label>
          ) : null}
        </div>

        {signatureQuestion ? (
          <label className="manifestCheckbox">
            <input
              defaultChecked={signatureQuestion.answer?.value_boolean === true}
              disabled={isLocked}
              name={signatureQuestion.id}
              required={signatureQuestion.is_required}
              type="checkbox"
              value="true"
            />
            <span>
              Declaro que li, compreendi e estou de acordo com este Termo de Compromisso da Mentoria Construtores de
              Riqueza.
            </span>
          </label>
        ) : null}
      </article>

      <div className="activityActions">
        {isLocked ? <span className="lockedSubmission">Respostas enviadas e bloqueadas para edição.</span> : null}
        <Link className="activityBackAction" href={`/cursos/${courseSlug}/aulas/${lessonId}`}>
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar
        </Link>
        <button disabled={isLocked} name="_mode" type="submit" value="draft">
          <span className="material-symbols-outlined">save</span>
          Salvar rascunho
        </button>
        <button className="primary" disabled={isLocked} name="_mode" type="submit" value="submitted">
          Enviar compromisso
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}

function QuestionInput({
  disabled,
  question,
  onBooleanChange
}: {
  disabled: boolean;
  question: Question;
  onBooleanChange: (value: boolean) => void;
}) {
  const answer = question.answer;

  if (question.question_type === "long_text") {
    return (
      <textarea
        defaultValue={answer?.value_text || ""}
        disabled={disabled}
        name={question.id}
        required={question.is_required}
        rows={4}
      />
    );
  }

  if (question.question_type === "number") {
    return (
      <input
        defaultValue={answer?.value_number ?? ""}
        disabled={disabled}
        min="0"
        name={question.id}
        required={question.is_required}
        type="number"
      />
    );
  }

  if (question.question_type === "money") {
    return (
      <span className="moneyField">
        <b>R$</b>
        <input
          defaultValue={answer?.value_number ?? ""}
          disabled={disabled}
          min="0"
          name={question.id}
          placeholder="0,00"
          required={question.is_required}
          step="0.01"
          type="number"
        />
      </span>
    );
  }

  if (question.question_type === "boolean") {
    if (question.metadata?.display === "checkbox") {
      return (
        <label className="checkboxField">
          <input
            defaultChecked={answer?.value_boolean === true}
            disabled={disabled}
            name={question.id}
            required={question.is_required}
            type="checkbox"
            value="true"
          />
          <span>Assinar e confirmar compromisso</span>
        </label>
      );
    }

    return (
      <div className="booleanGroup">
        <label>
          <input
            defaultChecked={answer?.value_boolean === true}
            disabled={disabled}
            name={question.id}
            onChange={() => onBooleanChange(true)}
            required={question.is_required}
            type="radio"
            value="true"
          />
          Sim
        </label>
        <label>
          <input
            defaultChecked={answer?.value_boolean === false}
            disabled={disabled}
            name={question.id}
            onChange={() => onBooleanChange(false)}
            required={question.is_required}
            type="radio"
            value="false"
          />
          Não
        </label>
      </div>
    );
  }

  if (question.question_type === "location") {
    const location = answer?.value_json || {};

    return (
      <div className="locationGrid">
        <input defaultValue={location.local || ""} disabled={disabled} name={`${question.id}__local`} placeholder="Local" required />
        <input defaultValue={location.regiao || ""} disabled={disabled} name={`${question.id}__regiao`} placeholder="Região" required />
        <input defaultValue={location.estado || ""} disabled={disabled} name={`${question.id}__estado`} placeholder="Estado" required />
        <input defaultValue={location.pais || ""} disabled={disabled} name={`${question.id}__pais`} placeholder="País" required />
      </div>
    );
  }

  if (question.question_type === "select") {
    const options = getSelectOptions(question.metadata?.options);

    if (question.metadata?.display === "cards") {
      return (
        <div className="profileChoiceGrid">
          {options.map((option, index) => (
            <label className="profileChoice" key={option.value}>
              <input
                defaultChecked={answer?.value_text === option.value}
                disabled={disabled}
                name={question.id}
                required={question.is_required}
                type="radio"
                value={option.value}
              />
              <span className="profileChoiceNumber">{index + 1}</span>
              <span className="profileChoiceText">{option.label}</span>
              <span className="material-symbols-outlined profileChoiceCheck">check_circle</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <select defaultValue={answer?.value_text || ""} disabled={disabled} name={question.id} required={question.is_required}>
        <option disabled value="">
          Selecione uma opção
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      defaultValue={answer?.value_text || ""}
      disabled={disabled}
      name={question.id}
      required={question.is_required}
      type="text"
    />
  );
}

function translateStatus(status: string) {
  if (status === "submitted") {
    return "Enviada";
  }

  if (status === "reviewed") {
    return "Revisada";
  }

  return "Rascunho";
}

function getSectionIcon(section: string) {
  const normalized = section.toLocaleLowerCase("pt-BR");

  if (normalized.includes("finance") || normalized.includes("capital") || normalized.includes("patrim")) {
    return "payments";
  }

  if (normalized.includes("meta") || normalized.includes("objetivo")) {
    return "flag";
  }

  if (normalized.includes("diagn")) {
    return "monitoring";
  }

  return "edit_note";
}

function getSelectOptions(rawOptions: unknown): SelectOption[] {
  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions.flatMap((option) => {
    if (typeof option === "string") {
      return [{ label: option, value: option }];
    }

    if (
      option &&
      typeof option === "object" &&
      "label" in option &&
      "value" in option &&
      typeof option.label === "string" &&
      typeof option.value === "string"
    ) {
      return [{ label: option.label, value: option.value }];
    }

    return [];
  });
}
