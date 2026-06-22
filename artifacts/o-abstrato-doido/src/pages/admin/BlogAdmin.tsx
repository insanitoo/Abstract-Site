import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListBlog,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  getListBlogQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

type BlogPost = {
  id: number;
  titulo: string;
  conteudo: string;
  imagemCapaUrl?: string | null;
  dataPublicacao: string;
};

const postSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  conteudo: z.string().min(1, "Conteúdo obrigatório"),
  imagemCapaUrl: z.string().optional(),
});

type PostValues = z.infer<typeof postSchema>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  const { data: posts, isLoading } = useListBlog();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { titulo: "", conteudo: "", imagemCapaUrl: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ titulo: "", conteudo: "", imagemCapaUrl: "" });
    setOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    form.reset({ titulo: post.titulo, conteudo: post.conteudo, imagemCapaUrl: post.imagemCapaUrl ?? "" });
    setOpen(true);
  }

  function onSubmit(values: PostValues) {
    const data = {
      titulo: values.titulo,
      conteudo: values.conteudo,
      imagemCapaUrl: values.imagemCapaUrl || undefined,
    };
    if (editing) {
      updatePost.mutate({ id: editing.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBlogQueryKey() }); setOpen(false); toast({ title: "Artigo actualizado" }); },
        onError: () => toast({ title: "Erro ao actualizar", variant: "destructive" }),
      });
    } else {
      createPost.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBlogQueryKey() }); setOpen(false); toast({ title: "Artigo publicado" }); },
        onError: () => toast({ title: "Erro ao publicar", variant: "destructive" }),
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deletePost.mutate({ id: deleting.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBlogQueryKey() }); setDeleting(null); toast({ title: "Artigo removido" }); },
      onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
    });
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts?.length ?? 0} artigos</p>
        </div>
        <Button onClick={openCreate} data-testid="button-novo-post" className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Novo Artigo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : posts && posts.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Título</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[hsl(40,10%,85%)] last:border-0" data-testid={`row-post-${post.id}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{post.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {post.conteudo.slice(0, 60)}…
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{formatDate(post.dataPublicacao)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(post)} data-testid={`button-edit-post-${post.id}`} className="p-2 text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                      <button onClick={() => setDeleting(post)} data-testid={`button-delete-post-${post.id}`} className="p-2 text-muted-foreground hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white py-20 text-center">
          <p className="text-muted-foreground">Nenhum artigo publicado</p>
          <button onClick={openCreate} className="mt-3 text-sm text-foreground underline">Publicar primeiro artigo</button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">{editing ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="titulo" render={({ field }) => (
                <FormItem><FormLabel className="text-xs tracking-widest uppercase">Título *</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imagemCapaUrl" render={({ field }) => (
                <FormItem>
                  <ImageUpload value={field.value} onChange={field.onChange} label="Imagem de Capa" />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="conteudo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase">Conteúdo *</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="rounded-none resize-none font-mono text-sm" rows={12} placeholder="Escreva o artigo aqui..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase w-full sm:w-auto">Cancelar</Button>
                <Button type="submit" disabled={createPost.isPending || updatePost.isPending} data-testid="button-submit-post" className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90 w-full sm:w-auto">
                  {editing ? "Actualizar" : "Publicar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-none mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-normal">Remover Artigo</AlertDialogTitle>
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
