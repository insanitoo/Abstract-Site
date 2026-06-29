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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

type Obra = {
  id: number;
  titulo: string;
  descricao?: string | null;
  tecnica?: string | null;
  dimensoes?: string | null;
  preco?: string | null;
  status: string;
  tamanho?: string | null;
  imagemUrl?: string | null;
  imagemUrl2?: string | null;
  imagemUrl3?: string | null;
  dataCriacao: string;
};

const obraSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  descricao: z.string().optional(),
  tecnica: z.string().optional(),
  dimensoes: z.string().optional(),
  preco: z.string().optional(),
  status: z.enum(["disponivel", "vendido"]),
  tamanho: z.enum(["grande", "media", "pequena", ""]).optional(),
  imagemUrl: z.string().optional(),
  imagemUrl2: z.string().optional(),
  imagemUrl3: z.string().optional(),
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

  const emptyValues: ObraValues = {
    titulo: "", descricao: "", tecnica: "", dimensoes: "", preco: "",
    status: "disponivel", tamanho: "", imagemUrl: "", imagemUrl2: "", imagemUrl3: ""
  };

  const form = useForm<ObraValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: emptyValues,
  });

  function openCreate() {
    setEditing(null);
    form.reset(emptyValues);
    setOpen(true);
  }

  function openEdit(obra: Obra) {
    setEditing(obra);
    form.reset({
      titulo: obra.titulo,
      descricao: obra.descricao ?? "",
      tecnica: obra.tecnica ?? "",
      dimensoes: obra.dimensoes ?? "",
      preco: obra.preco ?? "",
      status: obra.status as "disponivel" | "vendido",
      tamanho: (obra.tamanho ?? "") as "grande" | "media" | "pequena" | "",
      imagemUrl: obra.imagemUrl ?? "",
      imagemUrl2: obra.imagemUrl2 ?? "",
      imagemUrl3: obra.imagemUrl3 ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: ObraValues) {
    const data = {
      titulo: values.titulo,
      descricao: values.descricao || undefined,
      tecnica: values.tecnica || undefined,
      dimensoes: values.dimensoes || undefined,
      preco: values.preco || undefined,
      status: values.status,
      tamanho: (values.tamanho || undefined) as "grande" | "media" | "pequena" | undefined,
      imagemUrl: values.imagemUrl || undefined,
      imagemUrl2: values.imagemUrl2 || undefined,
      imagemUrl3: values.imagemUrl3 || undefined,
    };

    if (editing) {
      updateObra.mutate({ id: editing.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() }); setOpen(false); toast({ title: "Obra actualizada" }); },
        onError: () => toast({ title: "Erro ao actualizar", variant: "destructive" }),
      });
    } else {
      createObra.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() }); setOpen(false); toast({ title: "Obra criada" }); },
        onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteObra.mutate({ id: deleting.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() }); setDeleting(null); toast({ title: "Obra removida" }); },
      onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
    });
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Obras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{obras?.length ?? 0} no total</p>
        </div>
        <Button onClick={openCreate} data-testid="button-nova-obra" className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Nova Obra
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : obras && obras.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal w-14">Img</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Título</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Técnica</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id} className="border-b border-[hsl(40,10%,85%)] last:border-0" data-testid={`row-obra-${obra.id}`}>
                  <td className="px-4 py-3">
                    {obra.imagemUrl ? (
                      <img src={obra.imagemUrl} alt={obra.titulo} className="w-12 h-12 object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-[hsl(40,43%,96%)] flex items-center justify-center text-muted-foreground text-xs">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{obra.titulo}</p>
                    {obra.preco && <p className="text-xs text-muted-foreground">{obra.preco}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-muted-foreground">{obra.tecnica ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 ${obra.status === "disponivel" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                      {obra.status === "disponivel" ? "Disponível" : "Vendido"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(obra)} data-testid={`button-edit-obra-${obra.id}`} className="p-2 text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                      <button onClick={() => setDeleting(obra)} data-testid={`button-delete-obra-${obra.id}`} className="p-2 text-muted-foreground hover:text-red-600"><Trash2 size={16} /></button>
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
          <button onClick={openCreate} className="mt-3 text-sm text-foreground underline">Adicionar primeira obra</button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">{editing ? "Editar Obra" : "Nova Obra"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="titulo" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Título *</FormLabel><FormControl><Input {...field} data-testid="input-titulo" className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />

              {/* Fotos */}
              <div className="space-y-3">
                <p className="text-xs tracking-widest uppercase font-medium">Fotos</p>
                <FormField control={form.control} name="imagemUrl" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Foto Principal" />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imagemUrl2" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Foto 2 (opcional)" />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imagemUrl3" render={({ field }) => (
                  <FormItem>
                    <ImageUpload value={field.value} onChange={field.onChange} label="Foto 3 (opcional)" />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="descricao" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Descrição</FormLabel><FormControl><Textarea {...field} className="rounded-none resize-none" rows={3} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="tecnica" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Técnica</FormLabel><FormControl><Input {...field} placeholder="ex: Acrílico sobre tela" className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="dimensoes" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Dimensões</FormLabel><FormControl><Input {...field} placeholder="ex: 100x80cm" className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="preco" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Preço</FormLabel><FormControl><Input {...field} placeholder="ex: 150.000 Kz" data-testid="input-preco" className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="disponivel">Disponível</SelectItem><SelectItem value="vendido">Vendido</SelectItem></SelectContent>
                    </Select>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tamanho" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-widest uppercase">Tamanho</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl><SelectTrigger className="rounded-none"><SelectValue placeholder="Sem categoria" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Sem categoria</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="pequena">Pequena</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage /></FormItem>
                )} />
              </div>

              <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createObra.isPending || updateObra.isPending} data-testid="button-submit-obra" className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90 w-full sm:w-auto">
                  {editing ? "Actualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-none mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-normal">Remover Obra</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que quer remover "{deleting?.titulo}"?</AlertDialogDescription>
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
