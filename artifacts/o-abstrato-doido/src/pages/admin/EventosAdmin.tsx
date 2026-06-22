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

type Evento = {
  id: number;
  nome: string;
  local?: string | null;
  dataEvento: string;
  tipo: string;
  descricao?: string | null;
  imagemCapaUrl?: string | null;
  linkInscricao?: string | null;
};

const eventoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  local: z.string().optional(),
  dataEvento: z.string().min(1, "Data obrigatória"),
  tipo: z.enum(["futuro", "passado"]),
  descricao: z.string().optional(),
  imagemCapaUrl: z.string().optional(),
  linkInscricao: z.string().optional(),
});

type EventoValues = z.infer<typeof eventoSchema>;

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

  const form = useForm<EventoValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: { nome: "", local: "", dataEvento: "", tipo: "futuro", descricao: "", imagemCapaUrl: "", linkInscricao: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ nome: "", local: "", dataEvento: "", tipo: "futuro", descricao: "", imagemCapaUrl: "", linkInscricao: "" });
    setOpen(true);
  }

  function openEdit(evento: Evento) {
    setEditing(evento);
    form.reset({
      nome: evento.nome,
      local: evento.local ?? "",
      dataEvento: evento.dataEvento,
      tipo: evento.tipo as "futuro" | "passado",
      descricao: evento.descricao ?? "",
      imagemCapaUrl: evento.imagemCapaUrl ?? "",
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gestão de Eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{eventos?.length ?? 0} eventos no total</p>
        </div>
        <Button onClick={openCreate} data-testid="button-novo-evento" className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Novo Evento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : eventos && eventos.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Nome</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden md:table-cell">Local</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Data</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Tipo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} className="border-b border-[hsl(40,10%,85%)] last:border-0" data-testid={`row-evento-${evento.id}`}>
                  <td className="px-4 py-3 font-medium">{evento.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{evento.local ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evento.dataEvento}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${evento.tipo === "futuro" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                      {evento.tipo === "futuro" ? "Futuro" : "Passado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(evento)} data-testid={`button-edit-evento-${evento.id}`} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleting(evento)} data-testid={`button-delete-evento-${evento.id}`} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
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
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">{editing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Nome *</FormLabel><FormControl><Input {...field} data-testid="input-nome" className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="local" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Local</FormLabel><FormControl><Input {...field} data-testid="input-local" className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dataEvento" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Data *</FormLabel><FormControl><Input {...field} type="date" data-testid="input-dataEvento" className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-none" data-testid="select-tipo"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="futuro">Futuro</SelectItem><SelectItem value="passado">Passado</SelectItem></SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="descricao" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Descrição</FormLabel><FormControl><Textarea {...field} className="rounded-none resize-none" rows={3} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imagemCapaUrl" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">URL Imagem Capa</FormLabel><FormControl><Input {...field} placeholder="https://..." className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="linkInscricao" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Link Inscrição</FormLabel><FormControl><Input {...field} placeholder="https://..." className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase">Cancelar</Button>
                <Button type="submit" disabled={createEvento.isPending || updateEvento.isPending} data-testid="button-submit-evento" className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
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
