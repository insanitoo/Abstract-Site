import { useState } from "react";
import { useListCursos, useVerificarChaveCurso } from "@workspace/api-client-react";
import type { Curso } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Play, ChevronLeft, GraduationCap } from "lucide-react";

const WA = "244934959424";

function buildWACurso(nome: string) {
  const msg = encodeURIComponent(`Vi o curso "${nome}" disponível, quero um acesso.`);
  return `https://wa.me/${WA}?text=${msg}`;
}

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

function VideoPlayer({ url }: { url: string }) {
  if (!url) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-white/60 text-sm">Vídeo não disponível</p>
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        src={url}
        controls
        controlsList="nodownload"
        className="w-full h-full"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

function CursoModal({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  const [chave, setChave] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [erro, setErro] = useState("");
  const [aulaIdx, setAulaIdx] = useState(0);
  const aulas = parseAulas(curso.aulas);

  const verificar = useVerificarChaveCurso();

  function handleVerificar() {
    if (!chave.trim()) return;
    verificar.mutate({ id: curso.id, data: { chave: chave.trim() } }, {
      onSuccess: (res) => {
        if (res.valida) {
          setUnlocked(true);
          setErro("");
        } else {
          setErro("Chave incorrecta. Tenta novamente.");
        }
      },
      onError: () => {
        setErro("Chave incorrecta. Tenta novamente.");
      }
    });
  }

  return (
    <DialogContent className="max-w-2xl rounded-none p-0 overflow-hidden max-h-[92vh] flex flex-col">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Capa + Info */}
        <div className="flex items-start gap-4 p-6 border-b border-border">
          {curso.imagemCapaUrl ? (
            <img src={curso.imagemCapaUrl} alt={curso.nome} className="w-20 h-20 object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={28} className="text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-serif text-xl text-foreground">{curso.nome}</h2>
            {curso.descricao && (
              <p className="text-sm text-muted-foreground mt-1">{curso.descricao}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{aulas.length} {aulas.length === 1 ? "aula" : "aulas"}</p>
          </div>
        </div>

        {!unlocked ? (
          /* Ecrã de desbloqueio */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-center">
              
              
              <p className="text-sm text-muted-foreground">Insere a chave de acesso para ver as aulas</p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-3">
              <Input
                type="password"
                placeholder="Chave de acesso"
                value={chave}
                onChange={(e) => { setChave(e.target.value); setErro(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleVerificar()}
                className="rounded-none text-center tracking-widest"
              />
              {erro && <p className="text-xs text-red-600 text-center">{erro}</p>}
              <Button
                onClick={handleVerificar}
                disabled={verificar.isPending || !chave.trim()}
                className="rounded-none text-xs tracking-widest uppercase bg-primary hover:bg-primary/90"
              >
                {verificar.isPending ? "A verificar..." : "Desbloquear"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Se não tem acesso a este curso,{" "}
                <a
                  href={buildWACurso(curso.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  clique aqui para Participar
                </a>
              </p>
            </div>
          </div>
        ) : (
          /* Player de vídeo + lista de aulas */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {aulas.length > 0 ? (
              <>
                <VideoPlayer url={aulas[aulaIdx].videoUrl} />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {aulaIdx > 0 && (
                      <button
                        onClick={() => setAulaIdx(aulaIdx - 1)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft size={14} /> Anterior
                      </button>
                    )}
                    <p className="font-medium text-sm text-foreground flex-1 text-center">
                      {aulaIdx + 1}. {aulas[aulaIdx].titulo}
                    </p>
                    {aulaIdx < aulas.length - 1 && (
                      <button
                        onClick={() => setAulaIdx(aulaIdx + 1)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Próxima <ChevronLeft size={14} className="rotate-180" />
                      </button>
                    )}
                  </div>

                  {aulas.length > 1 && (
                    <div className="border border-border">
                      <p className="px-3 py-2 text-xs tracking-widest uppercase text-muted-foreground border-b border-border">Aulas</p>
                      {aulas.map((aula, i) => (
                        <button
                          key={i}
                          onClick={() => setAulaIdx(i)}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm border-b border-border last:border-0 transition-colors ${
                            i === aulaIdx ? "bg-primary/5 text-primary" : "text-foreground hover:bg-[hsl(40,43%,96%)]"
                          }`}
                        >
                          <Play size={14} className="flex-shrink-0" />
                          <span>{i + 1}. {aula.titulo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <p className="text-muted-foreground font-serif">Este curso ainda não tem aulas disponíveis.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default function Cursos() {
  const { data: cursos, isLoading } = useListCursos();
  const [selected, setSelected] = useState<Curso | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Aprendizagem</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Cursos</h1>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-video" />
                  <Skeleton className="h-5 mt-3 w-3/4" />
                  <Skeleton className="h-4 mt-2 w-1/2" />
                </div>
              ))}
            </div>
          ) : cursos && cursos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso) => {
                const aulas = parseAulas(curso.aulas);
                return (
                  <div key={curso.id} className="group bg-card border border-card-border overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-primary/10 relative">
                      {curso.imagemCapaUrl ? (
                        <img
                          src={curso.imagemCapaUrl}
                          alt={curso.nome}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <GraduationCap size={40} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Lock size={20} className="text-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h2 className="font-serif text-lg text-foreground leading-tight">{curso.nome}</h2>
                      {curso.descricao && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{curso.descricao}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {aulas.length} {aulas.length === 1 ? "aula" : "aulas"}
                        </span>
                        <button
                          onClick={() => setSelected(curso)}
                          className="text-xs px-4 py-1.5 bg-primary text-white hover:bg-primary/90 transition-colors tracking-wide flex items-center gap-1.5"
                        >
                          <Lock size={12} /> Aceder
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center">
              <h2 className="font-serif text-2xl text-foreground mb-2">Cursos disponíveis em breve</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Estamos a preparar conteúdo especial para ti. Volta em breve para saber mais.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && <CursoModal curso={selected} onClose={() => setSelected(null)} />}
      </Dialog>
    </div>
  );
}
