"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

const initialState: FormState = { ok: true, message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-fun-gray">
          Password
        </span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-fun-gray-darker bg-fun-pink-darkest px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fun-pink"
        />
      </label>

      {state.message && !state.ok && (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-fun-pink px-6 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
