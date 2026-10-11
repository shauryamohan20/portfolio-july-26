"use client";

/** Submit button that asks for confirmation before a delete action runs. */
export default function ConfirmDeleteButton({
  what,
  label = "Delete",
}: {
  what: string;
  label?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const ok = window.confirm(
          `Delete "${what}"? This removes it from the site and cannot be undone.`
        );
        if (!ok) event.preventDefault();
      }}
      className="rounded-full border border-fun-gray-darker px-4 py-1.5 text-xs font-bold text-fun-gray transition-colors hover:border-red-400 hover:text-red-300"
    >
      {label}
    </button>
  );
}
