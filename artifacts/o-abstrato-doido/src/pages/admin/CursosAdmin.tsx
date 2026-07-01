import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListCursos,
  useCreateCurso,
  useUpdateCurso,
  useDeleteCurso,
  getListCursosQueryKey,
} from "@workspace/api-client-react";
import type { Curso } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, GraduationCap, Upload, X, ChevronLeft, ChevronRight, Key } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

type Aula = {
  titulo: string;
  videoUrl: string;
};

function parseAulas(raw: string | null | undefined): Aula[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Aula[];
  } catch {
  }
  return [];
}

const cursoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  descricao: z.string().optional(),
  imagemCapaUrl: z.string().optional(),
  chaveAcesso: z.string().min(1, "Chave de acesso obrigatória"),
});

type CursoValues = z.infer<typeof cursoSchema>;

type Step = 1 | 2 | 3;

export default function CursosAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [editing, setEditing] = useState<Curso | null>(null);
  const [deleting, setDeleting] = useState<Curso | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const { data: cursos, isLoading } = useListCursos();
  const createCurso = useCreateCurso();
  const updateCurso = useUpdateCurso();
  const deleteCurso = useDeleteCurso();

  const form = useForm<CursoValues>({
    resolver: zodResolver(cursoSchema),
    defaultValues: { nome: "", descricao: "", imagemCapaUrl: "", chaveAcesso: "" },
  });

  function openCreate() {
    setEditing(null);
    setAulas([]);
    setStep(1);
    form.reset({ nome: "", descricao: "", imagemCapaUrl: "", chaveAcesso: "" });
    setOpen(true);
  }

  function openEdit(curso: Curso) {
    setEditing(curso);
    setAulas(parseAulas(curso.aulas));
    setStep(1);
    form.reset({
      nome: curso.nome,
      descricao: curso.descricao ?? "",
      imagemCapaUrl: curso.imagemCapaUrl ?? "",
      chaveAcesso: curso.chaveAcesso,
    });
    setOpen(true);
  }

  function handleNextStep() {
    if (step === 1) {
      form.trigger(["nome", "descricao", "imagemCapaUrl"]).then((valid) => {
        if (valid) setStep(2);
      });
    } else if (step === 2) {
      setStep(3);
    }
  }

  function addAula() {
    if (aulas.length >= 10) return;
    setAulas([...aulas, { titulo: `Aula ${aulas.length + 1}`, videoUrl: "" }]);
  }

  function removeAula(idx: number) {
    setAulas(aulas.filter((_, i) => i !== idx));
  }

  function updateAulaTitulo(idx: number, titulo: string) {
    setAulas(aulas.map((a, i) => i === idx ? { ...a, titulo } : a));
  }

  async function handleVideoUpload(idx: number, file: File) {
    const dur = await getVideoDuration(file);
    if (dur > 600) {
      toast({ title: "Vídeo demasiado longo", description: "Máximo 10 minutos por aula.", variant: "destructive" });
      return;
    }

    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/video", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Falha no upload");
      const data = await res.json() as { url: string };
      setAulas(aulas.map((a, i) => i === idx ? { ...a, videoUrl: data.url } : a));
    } catch {
      toast({ title: "Erro no upload do vídeo", variant: "destructive" });
    } finally {
      setUploadingIdx(null);
    }
  }

  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = url;
    });
  }

  function onSubmit(values: CursoValues) {
    const data = {
      nome: values.nome,
      descricao: values.descricao || undefined,
      imagemCapaUrl: values.imagemCapaUrl || undefined,
      chaveAcesso: values.chaveAcesso,
      aulas: aulas.length > 0 ? JSON.stringify(aulas) : undefined,
    };

    if (editing) {
      updateCurso.mutate({ id: editing.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCursosQueryKey() });
          setOpen(false);
          toast({ title: "Curso actualizado" });
        },
        onError: () => toast({ title: "Erro ao actualizar", variant: "destructive" }),
      });
    } else {
      createCurso.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCursosQueryKey() });
          setOpen(false);
          toast({ title: "Curso criado" });
        },
        onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteCurso.mutate({ id: deleting.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCursosQueryKey() });
        setDeleting(null);
        toast({ title: "Curso removido" });
      },
      onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
    });
  }

  const stepLabels: Record<Step, string> = {
    1: "Informações",
    2: "Aulas",
    3: "Acesso",
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cursos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cursos?.length ?? 0} no total</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          <Plus size={14} /> Novo Curso
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : cursos && cursos.length > 0 ? (
        <div className="border border-[hsl(40,10%,85%)] bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-[hsl(40,10%,85%)] bg-[hsl(40,43%,96%)]">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal w-14">Capa</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal">Nome</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-normal hidden sm:table-cell">Aulas</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => {
                const aulasArr = parseAulas(curso.aulas);
                return (
                  <tr key={curso.id} className="border-b border-[hsl(40,10%,85%)] last:border-0">
                    <td className="px-4 py-3">
                      {curso.imagemCapaUrl ? (
                        <img src={curso.imagemCapaUrl} alt={curso.nome} className="w-12 h-12 object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-[hsl(40,43%,96%)] flex items-center justify-center">
                          <GraduationCap size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{curso.nome}</p>
                      {curso.descricao && <p className="text-xs text-muted-foreground line-clamp-1">{curso.descricao}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{aulasArr.length} aulas</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(curso)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                        <button onClick={() => setDeleting(curso)} className="p-2 text-muted-foreground hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-[hsl(40,10%,85%)] bg-white py-20 text-center">
          <GraduationCap size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum curso adicionado</p>
          <button onClick={openCreate} className="mt-3 text-sm text-foreground underline">Adicionar primeiro curso</button>
        </div>
      )}

      {/* Dialog de criação/edição */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              {editing ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
          </DialogHeader>

          {/* Steps indicator */}
          <div className="flex items-center gap-0 mb-6">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-7 h-7 text-xs font-medium rounded-full flex-shrink-0 ${
                  step === s ? "bg-foreground text-white" : step > s ? "bg-primary text-white" : "bg-[hsl(40,43%,96%)] text-muted-foreground"
                }`}>
                  {s}
                </div>
                <div className="flex-1 text-xs text-muted-foreground ml-1.5 truncate hidden sm:block">{stepLabels[s]}</div>
                {s < 3 && <div className={`h-px flex-1 mx-2 ${step > s ? "bg-primary" : "bg-[hsl(40,10%,85%)]"}`} />}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Step 1: Informações */}
              {step === 1 && (
                <>
                  <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs tracking-widest uppercase">Nome do Curso *</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="imagemCapaUrl" render={({ field }) => (
                    <FormItem>
                      <ImageUpload value={field.value} onChange={field.onChange} label="Imagem de Capa" />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descricao" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs tracking-widest uppercase">Descrição</FormLabel><FormControl><Textarea {...field} className="rounded-none resize-none" rows={3} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              )}

              {/* Step 2: Aulas */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{aulas.length}/10 aulas</p>
                    {aulas.length < 10 && (
                      <button
                        type="button"
                        onClick={addAula}
                        className="flex items-center gap-1.5 text-xs text-foreground border border-foreground px-3 py-1.5 hover:bg-foreground hover:text-white transition-colors"
                      >
                        <Plus size={13} /> Adicionar aula
                      </button>
                    )}
                  </div>

                  {aulas.length === 0 && (
                    <div className="border border-dashed border-border py-12 text-center">
                      <Upload size={28} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Adiciona até 10 aulas (máx. 10 min cada)</p>
                    </div>
                  )}

                  {aulas.map((aula, idx) => (
                    <div key={idx} className="border border-[hsl(40,10%,85%)] p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground w-5 flex-shrink-0">{idx + 1}.</span>
                          <Input
                            value={aula.titulo}
                            onChange={(e) => updateAulaTitulo(idx, e.target.value)}
                            placeholder="Título da aula"
                            className="rounded-none text-sm h-8"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAula(idx)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {aula.videoUrl ? (
                        <div className="flex items-center gap-2">
                          <video src={aula.videoUrl} className="w-20 h-12 object-cover bg-black flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-600 truncate">Vídeo carregado</p>
                            <p className="text-xs text-muted-foreground truncate">{aula.videoUrl}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAulas(aulas.map((a, i) => i === idx ? { ...a, videoUrl: "" } : a))}
                            className="text-xs text-muted-foreground hover:text-red-600 flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className={`flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground border border-dashed border-border px-3 py-2 ${uploadingIdx === idx ? "opacity-50 cursor-wait" : ""}`}>
                          <Upload size={14} />
                          {uploadingIdx === idx ? "A carregar..." : "Carregar vídeo (máx. 10 min)"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={uploadingIdx !== null}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(idx, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Chave de acesso */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-[hsl(40,43%,96%)] border border-border p-4 flex gap-3">
                    <Key size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Chave de acesso</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Os alunos precisam desta chave para aceder ao conteúdo do curso.</p>
                    </div>
                  </div>
                  <FormField control={form.control} name="chaveAcesso" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase">Chave de Acesso *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="ex: CURSO2025"
                          className="rounded-none tracking-widest font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* Navegação entre steps */}
              <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="rounded-none text-xs tracking-widest uppercase gap-1"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs tracking-widest uppercase">Cancelar</Button>
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90 gap-1"
                    >
                      Próximo <ChevronRight size={14} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={createCurso.isPending || updateCurso.isPending}
                      className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90"
                    >
                      {editing ? "Actualizar" : "Criar Curso"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-none mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-normal">Remover Curso</AlertDialogTitle>
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
