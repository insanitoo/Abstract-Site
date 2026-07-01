import { useState } from "react";
import { useListEventos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";

const WA = "244934959424";

function buildWA(nome: string) {
  const msg = encodeURIComponent(
    `Olá, vi no site o evento "${nome}" e gostaria de saber mais / inscrever-me.`
  );
  return `https://wa.me/${WA}?text=${msg}`;
}

type EventoType = {
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

function parseImagens(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean) as string[];
  } catch { }
  return [];
}

function EventoModal({ evento, onClose }: { evento: EventoType; onClose: () => void }) {
  const adicionais = parseImagens(evento.imagensAdicionais);
  const fotos = [
    ...(evento.imagemCapaUrl ? [evento.imagemCapaUrl] : []),
    ...adicionais,
  ];
  const [fotoIdx, setFotoIdx] = useState(0);
  const isFuture = evento.tipo === "futuro";

  return (
    <DialogContent className="max-w-2xl rounded-none p-0 overflow-hidden max-h-[92vh] flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-6 right-3 z-10 p-1 bg-white/80 hover:bg-white rounded-full text-foreground"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Galeria de fotos */}
        {fotos.length > 0 && (
          <div className="md:w-2/5 flex-shrink-0 bg-[hsl(40,43%,96%)]">
            <div className="relative aspect-square md:h-full md:aspect-auto">
              <img
                src={fotos[fotoIdx]}
                alt={evento.nome}
                className="w-full h-full object-cover"
              />
              {fotos.length > 1 && (
                <>
                  <button
                    onClick={() => setFotoIdx((i) => (i - 1 + fotos.length) % fotos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setFotoIdx((i) => (i + 1) % fotos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full"
                    aria-label="Próxima"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {fotos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFotoIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === fotoIdx ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Detalhes */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-1">
              {isFuture ? "Próximo Evento" : "Evento Realizado"}
            </p>
            <h2 className="font-serif text-2xl text-foreground">{evento.nome}</h2>
          </div>

          {evento.local && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={13} /> {evento.local}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={13} /> {evento.dataEvento}
          </div>

          {evento.descricao && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Descrição</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{evento.descricao}</p>
            </div>
          )}

          {isFuture && (
            <div className="mt-auto pt-4">
              <a
                href={buildWA(evento.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
                Interessado
              </a>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export default function Agenda() {
  const { data: eventos, isLoading } = useListEventos();
  const [selected, setSelected] = useState<EventoType | null>(null);

  const futuros = eventos?.filter((e) => e.tipo === "futuro") ?? [];
  const passados = eventos?.filter((e) => e.tipo === "passado") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Eventos</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Agenda</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Próximos eventos */}
          <div>
            <h2 className="font-serif text-2xl text-primary mb-8 pb-3 border-b border-primary/30">
              Próximos Eventos
            </h2>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border border-border p-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            ) : futuros.length > 0 ? (
              <div className="flex flex-col gap-4">
                {futuros.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} isFuture onVer={() => setSelected(evento)} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-serif">Sem eventos futuros agendados</p>
            )}
          </div>

          {/* Eventos passados */}
          <div>
            <h2 className="font-serif text-2xl text-muted-foreground mb-8 pb-3 border-b border-border">
              Eventos Passados
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-border p-4">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : passados.length > 0 ? (
              <div className="flex flex-col gap-4">
                {passados.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} isFuture={false} onVer={() => setSelected(evento)} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-serif">Sem eventos anteriores</p>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && <EventoModal evento={selected} onClose={() => setSelected(null)} />}
      </Dialog>
    </div>
  );
}

function EventoCard({
  evento,
  isFuture,
  onVer,
}: {
  evento: EventoType;
  isFuture: boolean;
  onVer: () => void;
}) {
  return (
    <div className="border border-border bg-white overflow-hidden" data-testid={`card-evento-${evento.id}`}>
      <div className="flex">
        {evento.imagemCapaUrl && (
          <img
            src={evento.imagemCapaUrl}
            alt={evento.nome}
            className="w-28 h-28 object-cover flex-shrink-0"
          />
        )}
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <h3 className={`font-serif text-lg leading-tight ${isFuture ? "text-primary" : "text-foreground"}`}>
              {evento.nome}
            </h3>
            {evento.local && (
              <p className="text-muted-foreground text-sm mt-1.5 flex items-center gap-1">
                <MapPin size={12} /> {evento.local}
              </p>
            )}
            <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> {evento.dataEvento}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={onVer}
              data-testid={`button-ver-evento-${evento.id}`}
              className="text-xs px-3 py-1 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-colors tracking-wide"
            >
              Ver
            </button>
            {isFuture && (
              <a
                href={buildWA(evento.nome)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`button-interessado-evento-${evento.id}`}
                className="text-xs px-4 py-1 bg-primary text-white tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
                Interessado
              </a>
            )}
            {!isFuture && (
              <span className="text-xs tracking-widest uppercase text-muted-foreground border border-border px-3 py-1">
                Realizado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
