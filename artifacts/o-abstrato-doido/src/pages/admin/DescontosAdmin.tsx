import { useState, useEffect } from "react";
import { useListObras, useUpdateObra, getListObrasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

type DescontoRow = { id: number; titulo: string; imagemUrl?: string | null; preco?: string | null; desconto: string };

async function getGlobalDesconto(): Promise<string> {
  try {
    const r = await fetch("/api/configuracoes/desconto_global");
    const j = await r.json();
    return j.valor ?? "";
  } catch {
    return "";
  }
}

async function setGlobalDesconto(valor: string | null) {
  await fetch("/api/configuracoes/desconto_global", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor }),
  });
}

export default function DescontosAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: obras, isLoading } = useListObras();
  const updateObra = useUpdateObra();

  const [global, setGlobal] = useState("");
  const [rows, setRows] = useState<DescontoRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGlobalDesconto().then(setGlobal);
  }, []);

  useEffect(() => {
    if (!obras) return;
    setRows(
      obras.map((o) => ({
        id: o.id,
        titulo: o.titulo,
        imagemUrl: o.imagemUrl,
        preco: o.preco,
        desconto: o.desconto != null ? String(o.desconto) : "",
      }))
    );
  }, [obras]);

  function setRowDesconto(id: number, val: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, desconto: val } : r)));
  }

  async function save() {
    setSaving(true);
    try {
      const pct = parseInt(global);
      if (global !== "" && (isNaN(pct) || pct < 0 || pct > 100)) {
        toast({ title: "Desconto global deve ser entre 0 e 100", variant: "destructive" });
        setSaving(false);
        return;
      }
      await setGlobalDesconto(global === "" ? null : String(pct));

      const orig = obras ?? [];
      const mutations = rows
        .filter((row) => {
          const o = orig.find((x) => x.id === row.id);
          const origVal = o?.desconto != null ? String(o.desconto) : "";
          return origVal !== row.desconto;
        })
        .map((row) => {
          const val = row.desconto === "" ? null : parseInt(row.desconto);
          return updateObra.mutateAsync({ id: row.id, data: { desconto: val ?? undefined } as Parameters<typeof updateObra.mutateAsync>[0]["data"] });
        });
      await Promise.all(mutations);

      queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
      toast({ title: "Descontos guardados" });
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
          <h1 className="text-xl font-semibold text-foreground">Descontos</h1>
        </div>
        <Button onClick={save} disabled={saving || isLoading} className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          {saving ? "A guardar…" : "Guardar"}
        </Button>
      </div>

      {/* Global */}
      <div className="border border-[hsl(40,10%,85%)] bg-white p-5 mb-6">
        <p className="text-xs tracking-widest uppercase font-medium mb-3">Desconto Global (%)</p>
        <p className="text-xs text-muted-foreground mb-3">
          Aplicado a todas as obras que não têm desconto individual. Deixe em branco para desactivar.
        </p>
        <div className="flex items-center gap-2 max-w-xs">
          <Input
            type="number"
            min={0}
            max={100}
            value={global}
            onChange={(e) => setGlobal(e.target.value)}
            placeholder="ex: 10"
            className="rounded-none"
          />
          <span className="text-sm text-muted-foreground">%</span>
          {global !== "" && (
            <button onClick={() => setGlobal("")} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Per obra */}
      <p className="text-xs tracking-widest uppercase font-medium mb-3">Desconto por Obra (%)</p>
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white divide-y divide-[hsl(40,10%,85%)]">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 px-4 py-3">
              {row.imagemUrl ? (
                <img src={row.imagemUrl} alt={row.titulo} className="w-10 h-10 object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-[hsl(40,43%,96%)] shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{row.titulo}</p>
                {row.preco && <p className="text-xs text-muted-foreground">{row.preco}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={row.desconto}
                  onChange={(e) => setRowDesconto(row.id, e.target.value)}
                  placeholder="—"
                  className="rounded-none w-16 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">%</span>
                {row.desconto !== "" && (
                  <button onClick={() => setRowDesconto(row.id, "")} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
