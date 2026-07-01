import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListEventos,
  useCreateEvento,
  useUpdateEvento,
  useDeleteEvento,
  getListEventosQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

type Evento = {
  id: number;
  nome: string;
  local?: string | null;
  dataEvento: string;
  tipo: string;
  descricao?: string | null;
  imagemCapaUrl?: string | null;
  imagensAdicionais?: string | null;
  linkInscricao?: string | null;
};

const eventoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  local: z.string().optional(),
  dataEvento: z.string().min(1, "Data obrigatória"),
  tipo: z.enum(["futuro", "passado"]),
  descricao: z.string().optional(),
  imagemCapaUrl: z.string().optional(),
  imagemAdicional1: z.string().optional(),
  imagemAdicional2: z.string().optional(),
  linkInscricao: z.string().optional(),
});

type EventoValues = z.infer<typeof eventoSchema>;

function parseImagens(raw: string | null | undefined): [string, string] {
  if (!raw) return ["", ""];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return [parsed[0] ?? "", parsed[1] ?? ""];
  } catch { }
  return ["", ""];
}

function serializeImagens(a: string, b: string): string | undefined {
  const imgs = [a, b].filter(Boolean);
  return imgs.length > 0 ? JSON.stringify(imgs) : undefined;
}

export default function EventosAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [deleting, setDeleting] = useState<Evento | null>(null);

  const { data: eventos, isLoading } = useListEventos();
  const createEvento = useCreateEvento();
  const updateEvento = useUpdateEvento();
  const deleteEvento = useDeleteEvento();

  const emptyValues: EventoValues = {
    nome: "", local: "", dataEvento: "", tipo: "futuro",
    descricao: "", imagemCapaUrl: "", imagemAdicional1: "", imagemAdicional2: "", linkInscricao: "",
  };

  const form = useForm<EventoValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: emptyValues,
  });

  function openCreate() {
    setEditing(null);
    form.reset(emptyValues);
    setOpen(true);
  }

  function openEdit(evento: Evento) {
    setEditing(evento);
    const [img1, img2] = parseImagens(evento.imagensAdicionais);
    form.reset({
      nome: evento.nome,
      local: evento.local ?? "",
      dataEvento: evento.dataEvento,
      tipo: evento.tipo as "futuro" | "passado",
      descricao: evento.descricao ?? "",
      imagemCapaUrl: evento.imagemCapaUrl ?? "",
      imagemAdicional1: img1,
      imagemAdicional2: img2,
      linkInscricao: evento.linkInscricao ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: EventoValues) {
    const data = {
      nome: values.nome,
      local: values.local || undefined,
      dataEvento: values.dataEvento,
      tipo: values.tipo,
      descricao: values.descricao || undefined,
      imagemCapaUrl: values.imagemCapaUrl || undefined,
      imagensAdicionais: serializeImagens(values.imagemAdicional1 ?? "", values.imagemAdicional2 ?? ""),
      linkInscricao: values.linkInscricao || undefined,
    };
    if (editing) {
      updateEvento.mutate({ id: editing.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEventosQueryKey() }); setOpen(false); toast({ title: "Evento actualizado" }); },
        onError: () => toast({ title: "Erro ao actualizar", variant: "destructive" }),
      });
    } else {
      createEvento.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEventosQueryKey() }); setOpen(false); toast({ title: "Evento criado" }); },
        onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteEvento.mutate({ id: deleting.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEventosQueryKey() }); setDeleting(null); toast({ title: "Evento removido" }); },
      onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
    });
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{eventos?.length ?? 0} no total</p>
        </div>
        <Button onClick={openCreate} data-testid="button-novo-evento" className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Novo Evento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : eventos && eventos.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[360px]">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Nome</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Tipo</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} className="border-b border-[hsl(40,10%,85%)] last:border-0" data-testid={`row-evento-${evento.id}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{evento.nome}</p>
                    {evento.local && <p className="text-xs text-muted-foreground">{evento.local}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{evento.dataEvento}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 ${evento.tipo === "futuro" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                      {evento.tipo === "futuro" ? "Futuro" : "Passado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(evento)} data-testid={`button-edit-evento-${evento.id}`} className="p-2 text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                      <button onClick={() => setDeleting(evento)} data-testid={`button-delete-evento-${evento.id}`} className="p-2 text-muted-foreground hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white py-20 text-center">
          <p className="text-muted-foreground">Nenhum evento adicionado</p>
          <button onClick={openCreate} className="mt-3 text-sm text-foreground underline">Adicionar primeiro evento</button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">{editing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Nome *</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />

              {/* Fotos */}
              <div className="space-y-3">
                <p className="text-xs tracking-widest uppercase font-medium">Fotos</p>
                <FormField control={form.control} name="imagemCapaUrl" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Capa" />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imagemAdicional1" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Foto adicional 1" />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imagemAdicional2" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Foto adicional 2" />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="local" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Local</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dataEvento" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Data *</FormLabel><FormControl><Input {...field} type="date" className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="futuro">Futuro</SelectItem><SelectItem value="passado">Passado</SelectItem></SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="descricao" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Descrição</FormLabel><FormControl><Textarea {...field} className="rounded-none resize-none" rows={3} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="linkInscricao" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Link Inscrição</FormLabel><FormControl><Input {...field} placeholder="https://..." className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createEvento.isPending || updateEvento.isPending} data-testid="button-submit-evento" className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90 w-full sm:w-auto">
                  {editing ? "Actualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-normal">Remover Evento</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que quer remover "{deleting?.nome}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none text-xs tracking-widest uppercase">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-none text-xs tracking-widest uppercase bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
