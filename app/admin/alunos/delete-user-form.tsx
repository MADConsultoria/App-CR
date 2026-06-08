"use client";

import { deletePlatformUser } from "./actions";

type DeleteUserFormProps = {
  disabled?: boolean;
  userId: string;
  userName: string;
};

export function DeleteUserForm({ disabled, userId, userName }: DeleteUserFormProps) {
  return (
    <form
      action={deletePlatformUser}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          `Excluir ${userName}? Esta ação remove o acesso e os dados vinculados a este usuário.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input name="user_id" type="hidden" value={userId} />
      <button className="dangerAction" disabled={disabled} type="submit">
        Excluir
      </button>
    </form>
  );
}
