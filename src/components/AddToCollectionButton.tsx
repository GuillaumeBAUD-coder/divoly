"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FolderPlus, Plus } from "lucide-react";

type CollectionSummary = {
  id: string;
  name: string;
  _count?: { items: number };
  items?: Array<{ answerId?: string; answer?: { id: string } }>;
};

type AddToCollectionButtonProps = {
  answerId: string;
};

export function AddToCollectionButton({ answerId }: AddToCollectionButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;

    const controller = new AbortController();
    void fetch("/api/collections", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!controller.signal.aborted) setCollections(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [session?.user?.id, status]);

  function isInCollection(collection: CollectionSummary) {
    return collection.items?.some((item) => item.answerId === answerId || item.answer?.id === answerId) ?? false;
  }

  function requireLogin() {
    if (!session?.user?.id) {
      router.push("/login");
      return false;
    }

    return true;
  }

  function toggleCollection(collectionId: string) {
    if (!requireLogin()) return;

    startTransition(() => {
      void fetch(`/api/collections/${collectionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data: { added: boolean }) => {
          setCollections((current) =>
            current.map((collection) => {
              if (collection.id !== collectionId) return collection;

              const currentCount = collection._count?.items ?? 0;
              const nextItems = data.added
                ? [...(collection.items ?? []), { answerId }]
                : (collection.items ?? []).filter((item) => item.answerId !== answerId && item.answer?.id !== answerId);

              return {
                ...collection,
                _count: { items: Math.max(0, currentCount + (data.added ? 1 : -1)) },
                items: nextItems,
              };
            }),
          );
        })
        .catch(() => {});
    });
  }

  function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireLogin()) return;

    const name = newName.trim();
    if (!name) return;

    startTransition(() => {
      void fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((collection: CollectionSummary) => {
          setCollections((current) => [{ ...collection, items: [] }, ...current]);
          setNewName("");
        })
        .catch(() => {});
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (session?.user?.id ? setOpen((value) => !value) : router.push("/login"))}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
      >
        <FolderPlus size={14} />
        Add to collection
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-white/10 bg-[#11111a] p-3 shadow-2xl shadow-black/40">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Collections</p>

          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {collections.length > 0 ? (
              collections.map((collection) => {
                const selected = isInCollection(collection);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    disabled={isPending}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      selected ? "bg-cyan-300/12 text-cyan-200" : "bg-white/[0.04] text-white/65 hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="line-clamp-1">{collection.name}</span>
                    <span className="text-xs text-white/30">{collection._count?.items ?? 0}</span>
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl bg-white/[0.04] px-3 py-4 text-sm text-white/40">No collections yet.</p>
            )}
          </div>

          <form onSubmit={createCollection} className="mt-3 flex gap-2">
            <input
              className="search-input min-w-0 flex-1 rounded-xl px-3 py-2 text-xs"
              placeholder="New collection"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <button
              type="submit"
              disabled={isPending || !newName.trim()}
              className="btn-primary inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-50"
              aria-label="Create collection"
            >
              <Plus size={14} />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
