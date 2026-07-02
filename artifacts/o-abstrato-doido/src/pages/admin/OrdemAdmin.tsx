import { useState, useEffect } from "react";
import { useListObras, useUpdateObra, getListObrasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown, Star } from "lucide-react";

type ObraRow = {
  id: number;
  titulo: string;
  imagemUrl?: string | null;
  destaque: boolean;
  ordem?: number | null;
};

export default function OrdemAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: obras, isLoading } = useListObras();
  const updateObra = useUpdateObra();

  const [lista, setLista] = useState<ObraRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!obras) return;
    const sorted = [...obras].sort((a, b) => {
      if (a.ordem != null && b.ordem != null) return a.ordem - b.ordem;
      if (a.ordem != null) return -1;
      if (b.ordem != null) return 1;
      return a.id - b.id;
    });
    setLista(sorted.map((o) => ({ id: o.id, titulo: o.titulo, imagemUrl: o.imagemUrl, destaque: o.destaque ?? false, ordem: o.ordem })));
  }, [obras]);

  function move(idx: number, dir: -1 | 1) {
    const next = [...lista];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setLista(next);
  }

  function toggleDestaque(idx: number) {
    const next = [...lista];
    next[idx] = { ...next[idx], destaque: !next[idx].destaque };
    setLista(next);
  }

  async function saveAll() {
    setSaving(true);
    try {
      // Save order
      const reorderPayload = lista.map((o, i) => ({ id: o.id, ordem: i + 1 }));
      const res = await fetch("/api/obras/reordenar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderPayload),
      });
      if (!res.ok) throw new Error("Erro ao reordenar");

      // Save destaque for each that changed
      const original = obras ?? [];
      const destaqueMutations = lista
        .filter((o) => {
          const orig = original.find((x) => x.id === o.id);
          return orig && orig.destaque !== o.destaque;
        })
        .map((o) =>
          updateObra.mutateAsync({ id: o.id, data: { destaque: o.destaque } as Parameters<typeof updateObra.mutateAsync>[0]["data"] })
        );
      await Promise.all(destaqueMutations);

      queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
      toast({ title: "Guardado com sucesso" });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Ordem e Destaque</h1>
        </div>
        <Button onClick={saveAll} disabled={saving || isLoading} className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          {saving ? "A guardar…" : "Guardar"}
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span>= aparece em Destaque na página inicial (destaque até 4 obras)</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white divide-y divide-[hsl(40,10%,85%)]">
          {lista.map((obra, idx) => (
            <div key={obra.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{idx + 1}</span>
              {obra.imagemUrl ? (
                <img src={obra.imagemUrl} alt={obra.titulo} className="w-10 h-10 object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-[hsl(40,43%,96%)] shrink-0" />
              )}
              <p className="flex-1 text-sm font-medium truncate">{obra.titulo}</p>
              <button
                onClick={() => toggleDestaque(idx)}
                className="p-1.5 rounded-sm transition-colors"
                aria-label="Toggle destaque"
              >
                <Star
                  size={18}
                  className={obra.destaque ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}
                />
              </button>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  aria-label="Subir"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === lista.length - 1}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  aria-label="Descer"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
