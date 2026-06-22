import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListObras,
  useCreateObra,
  useUpdateObra,
  useDeleteObra,
  getListObrasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

type Obra = {
  id: number;
  titulo: string;
  descricao?: string | null;
  dimensoes?: string | null;
  preco?: string | null;
  status: string;
  imagemUrl?: string | null;
  dataCriacao: string;
};

const obraSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  descricao: z.string().optional(),
  dimensoes: z.string().optional(),
  preco: z.string().optional(),
  status: z.enum(["disponivel", "vendido"]),
  imagemUrl: z.string().optional(),
});

type ObraValues = z.infer<typeof obraSchema>;

export default function ObrasAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [deleting, setDeleting] = useState<Obra | null>(null);

  const { data: obras, isLoading } = useListObras();
  const createObra = useCreateObra();
  const updateObra = useUpdateObra();
  const deleteObra = useDeleteObra();

  const form = useForm<ObraValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: { titulo: "", descricao: "", dimensoes: "", preco: "", status: "disponivel", imagemUrl: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ titulo: "", descricao: "", dimensoes: "", preco: "", status: "disponivel", imagemUrl: "" });
    setOpen(true);
  }

  function openEdit(obra: Obra) {
    setEditing(obra);
    form.reset({
      titulo: obra.titulo,
      descricao: obra.descricao ?? "",
      dimensoes: obra.dimensoes ?? "",
      preco: obra.preco ?? "",
      status: obra.status as "disponivel" | "vendido",
      imagemUrl: obra.imagemUrl ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: ObraValues) {
    const data = {
      titulo: values.titulo,
      descricao: values.descricao || undefined,
      dimensoes: values.dimensoes || undefined,
      preco: values.preco || undefined,
      status: values.status,
      imagemUrl: values.imagemUrl || undefined,
    };

    if (editing) {
      updateObra.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
            setOpen(false);
            toast({ title: "Obra actualizada" });
          },
          onError: () => toast({ title: "Erro ao actualizar", variant: "destructive" }),
        }
      );
    } else {
      createObra.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
            setOpen(false);
            toast({ title: "Obra criada" });
          },
          onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
        }
      );
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteObra.mutate(
      { id: deleting.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
          setDeleting(null);
          toast({ title: "Obra removida" });
        },
        onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gestão de Obras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{obras?.length ?? 0} obras no total</p>
        </div>
        <Button onClick={openCreate} data-testid="button-nova-obra" className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Nova Obra
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : obras && obras.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Imagem</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Título</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden md:table-cell">Dimensões</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id} className="border-b border-[hsl(40,10%,85%)] last:border-0" data-testid={`row-obra-${obra.id}`}>
                  <td className="px-4 py-3">
                    {obra.imagemUrl ? (
                      <img src={obra.imagemUrl} alt={obra.titulo} className="w-12 h-12 object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-[hsl(40,43%,96%)] flex items-center justify-center text-muted-foreground text-xs">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{obra.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{obra.dimensoes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${obra.status === "disponivel" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                      {obra.status === "disponivel" ? "Disponível" : "Vendido"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(obra)}
                        data-testid={`button-edit-obra-${obra.id}`}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleting(obra)}
                        data-testid={`button-delete-obra-${obra.id}`}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                        aria-label="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white py-20 text-center">
          <p className="text-muted-foreground">Nenhuma obra adicionada</p>
          <button onClick={openCreate} className="mt-3 text-sm text-foreground underline">
            Adicionar primeira obra
          </button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              {editing ? "Editar Obra" : "Nova Obra"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="titulo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase">Título *</FormLabel>
                  <FormControl><Input {...field} data-testid="input-titulo" className="rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="descricao" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase">Descrição</FormLabel>
                  <FormControl><Textarea {...field} data-testid="input-descricao" className="rounded-none resize-none" rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="dimensoes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase">Dimensões</FormLabel>
                    <FormControl><Input {...field} placeholder="ex: 100x80cm" data-testid="input-dimensoes" className="rounded-none" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="preco" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase">Preço</FormLabel>
                    <FormControl><Input {...field} placeholder="ex: 1200€" data-testid="input-preco" className="rounded-none" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase">Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-none" data-testid="select-status">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="imagemUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase">URL da Imagem</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." data-testid="input-imagemUrl" className="rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createObra.isPending || updateObra.isPending}
                  data-testid="button-submit-obra"
                  className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90"
                >
                  {editing ? "Actualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-normal">Remover Obra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que quer remover "{deleting?.titulo}"? Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none text-xs tracking-widest uppercase">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="button-confirm-delete-obra"
              className="rounded-none text-xs tracking-widest uppercase bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
