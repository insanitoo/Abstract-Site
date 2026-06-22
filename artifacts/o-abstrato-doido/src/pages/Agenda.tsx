import { useListEventos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

export default function Agenda() {
  const { data: eventos, isLoading } = useListEventos();

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
                  <EventoCard key={evento.id} evento={evento} isFuture />
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
                  <EventoCard key={evento.id} evento={evento} isFuture={false} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-serif">Sem eventos anteriores</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function EventoCard({
  evento,
  isFuture,
}: {
  evento: {
    id: number;
    nome: string;
    local?: string | null;
    dataEvento: string;
    tipo: string;
    descricao?: string | null;
    imagemCapaUrl?: string | null;
    linkInscricao?: string | null;
  };
  isFuture: boolean;
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
          <div className="flex items-center gap-3 mt-3">
            {isFuture && evento.linkInscricao && (
              <a
                href={evento.linkInscricao}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`button-inscrever-${evento.id}`}
                className="text-xs px-4 py-1.5 bg-primary text-white tracking-widest uppercase hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                Inscrever-se <ExternalLink size={11} />
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
