"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function CreateCollectionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    startTransition(() => {
      void fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, description }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(() => {
          setName("");
          setDescription("");
          router.refresh();
        })
        .catch(() => {});
    });
  }

  return (
    <form onSubmit={handleSubmit} className="filter-studio rounded-[24px] p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/45">New collection</p>
      <input
        className="search-input mb-3 w-full rounded-xl px-4 py-3 text-sm"
        placeholder="Example: Questions for work"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <textarea
        className="search-input min-h-24 w-full rounded-xl px-4 py-3 text-sm"
        placeholder="Optional description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-50"
      >
        <Plus size={16} />
        Create collection
      </button>
    </form>
  );
}
