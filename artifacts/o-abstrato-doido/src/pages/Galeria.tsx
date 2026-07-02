import { useState } from "react";
import { useListObras } from "@workspace/api-client-react";
import type { Obra } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type StatusFilter = "todas" | "disponivel" | "vendido";
type TamanhoFilter = "todos" | "grande" | "pequena";

const WA = "244934959424";

function buildWA(titulo: string) {
  const msg = encodeURIComponent(
    `Olá, vi no seu site que a obra "${titulo}" ainda está disponível... Gostaria de comprá-la.`
  );
  return `https://wa.me/${WA}?text=${msg}`;
}

function getObraPhotos(obra: Obra): string[] {
  const photos: string[] = [];
  if (obra.imagemUrl) photos.push(obra.imagemUrl);
  if (obra.imagemUrl2) photos.push(obra.imagemUrl2);
  if (obra.imagemUrl3) photos.push(obra.imagemUrl3);
  if (obra.imagemUrl4) photos.push(obra.imagemUrl4);
  return photos;
}

function ObraModal({ obra, onClose }: { obra: Obra; onClose: () => void }) {
  const photos = getObraPhotos(obra);
  const [photoIdx, setPhotoIdx] = useState(0);

  const prev = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setPhotoIdx((i) => (i + 1) % photos.length);

  return (
    <DialogContent className="max-w-3xl rounded-none p-0 overflow-hidden max-h-[92vh] flex flex-col" aria-describedby={undefined}>
      <DialogTitle className="sr-only">{obra.titulo}</DialogTitle>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1 bg-white/80 hover:bg-white rounded-full text-foreground"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Galeria de fotos */}
        <div className="md:w-1/2 flex-shrink-0 bg-[hsl(40,43%,96%)]">
          {photos.length > 0 ? (
            <div className="relative aspect-square md:h-full md:aspect-auto">
              <img
                src={photos[photoIdx]}
                alt={obra.titulo}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full text-foreground"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full text-foreground"
                    aria-label="Próxima"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-square md:h-full md:aspect-auto flex items-center justify-center bg-primary/10">
              <span className="font-serif text-primary text-lg px-6 text-center">{obra.titulo}</span>
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 p-2 bg-white border-t border-border overflow-x-auto">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-colors ${
                    i === photoIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="md:w-1/2 overflow-y-auto p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
              {obra.status === "disponivel" ? "Disponível" : "Vendida"}
              {obra.tamanho && obra.tamanho !== "media" && ` · ${obra.tamanho === "grande" ? "Grande" : "Pequena"}`}
            </p>
            <h2 className="font-serif text-2xl text-foreground">{obra.titulo}</h2>
          </div>

          {obra.tecnica && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">Técnica</p>
              <p className="text-sm text-foreground">{obra.tecnica}</p>
            </div>
          )}

          {obra.tamanho && obra.tamanho !== "none" && obra.tamanho !== "media" && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">Tamanho</p>
              <p className="text-sm text-foreground">{obra.tamanho === "grande" ? "Grande" : "Pequena"}</p>
            </div>
          )}

          {obra.dimensoes && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">Dimensões</p>
              <p className="text-sm text-foreground">{obra.dimensoes}</p>
            </div>
          )}

          {obra.preco && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">Preço</p>
              <p className="text-base font-medium text-foreground">{obra.preco}</p>
            </div>
          )}

          {obra.descricao && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">Descrição</p>
              <p className="text-sm text-foreground leading-relaxed">{obra.descricao}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {obra.status === "disponivel" ? (
              <a
                href={buildWA(obra.titulo)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
                Interessado
              </a>
            ) : (
              <div className="w-full flex items-center justify-center px-6 py-3 bg-muted text-muted-foreground text-xs tracking-widest uppercase">
                Obra vendida
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function Galeria() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [tamanhoFilter, setTamanhoFilter] = useState<TamanhoFilter>("todos");
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);

  const params: Record<string, string | number> = {};
  if (statusFilter !== "todas") params.status = statusFilter;
  if (tamanhoFilter !== "todos") params.tamanho = tamanhoFilter;

  const { data: obras, isLoading } = useListObras(
    Object.keys(params).length > 0 ? params : undefined
  );

  const filteredObras = obras ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2"></p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Galeria</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-[hsl(40,43%,96%)]/95 backdrop-blur-sm border-b border-border px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col gap-3">
            {/* Estado */}
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground w-20 shrink-0">Estado</span>
              <div className="flex gap-2">
                {(["disponivel", "vendido"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(statusFilter === f ? "todas" : f)}
                    className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors ${
                      statusFilter === f
                        ? "bg-primary text-white"
                        : "bg-white border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "disponivel" ? "Disponíveis" : "Vendidas"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground w-20 shrink-0">Tamanho</span>
              <div className="flex gap-2">
                {(["grande", "pequena"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTamanhoFilter(tamanhoFilter === f ? "todos" : f)}
                    className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors ${
                      tamanhoFilter === f
                        ? "bg-primary text-white"
                        : "bg-white border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "grande" ? "Grandes" : "Pequenas"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square" />
                  <Skeleton className="h-4 mt-2 w-3/4" />
                  <Skeleton className="h-3 mt-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredObras.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredObras.map((obra) => (
                <div key={obra.id} className="group bg-card border border-card-border overflow-hidden" data-testid={`card-obra-${obra.id}`}>
                  <div className="aspect-square overflow-hidden bg-primary/10 relative">
                    {obra.imagemUrl ? (
                      <img
                        src={obra.imagemUrl}
                        alt={obra.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <span className="font-serif text-primary text-sm px-4 text-center">{obra.titulo}</span>
                      </div>
                    )}
                    {obra.status === "vendido" && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs tracking-wide">
                        Vendida
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-base text-foreground leading-tight">{obra.titulo}</p>
                    {obra.tecnica && (
                      <p className="text-xs text-muted-foreground mt-0.5">{obra.tecnica}</p>
                    )}
                    {obra.preco && (
                      <p className="text-xs font-medium text-foreground mt-0.5">{obra.preco}</p>
                    )}
                    {obra.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{obra.descricao}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-xs flex items-center gap-1 ${obra.status === "disponivel" ? "text-primary" : "text-muted-foreground"}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${obra.status === "disponivel" ? "bg-primary" : "bg-muted-foreground"}`} />
                        {obra.status === "disponivel" ? "Disponível" : "Vendido"}
                      </span>
                      <button
                        onClick={() => setSelectedObra(obra)}
                        data-testid={`button-ver-${obra.id}`}
                        className="text-xs px-3 py-1 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-colors tracking-wide"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-muted-foreground">Nenhuma obra encontrada</p>
              <button
                onClick={() => { setStatusFilter("todas"); setTamanhoFilter("todos"); }}
                className="mt-4 text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Modal de obra */}
      <Dialog open={!!selectedObra} onOpenChange={(o) => !o && setSelectedObra(null)}>
        {selectedObra && (
          <ObraModal obra={selectedObra} onClose={() => setSelectedObra(null)} />
        )}
      </Dialog>
    </div>
  );
}
