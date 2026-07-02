import { Link } from "wouter";
import { useListObras, useListEventos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import heroPng from "@assets/Hero.png";
import artistPng from "@assets/artista.png";


const WA = "244934959424";

function buildWA(msg: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

function ObraCard({ obra }: { obra: { id: number; titulo: string; imagemUrl?: string | null; status: string; dimensoes?: string | null } }) {
  return (
    <Link href="/galeria" data-testid={`card-obra-${obra.id}`} className="group block overflow-hidden bg-card border border-card-border">
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
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-0.5 ${obra.status === "disponivel" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            {obra.status === "disponivel" ? "Disponível" : "Vendido"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-serif text-base text-foreground">{obra.titulo}</p>
        {obra.dimensoes && <p className="text-xs text-muted-foreground mt-1">{obra.dimensoes}</p>}
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: obras, isLoading: obrasLoading } = useListObras({ limit: 4 });
  const { data: eventos, isLoading: eventosLoading } = useListEventos();

  const proximoEvento = eventos?.find((e) => e.tipo === "futuro") ?? eventos?.[eventos.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[77vh] md:h-[130vh] min-h-[420px] flex items-end pb-80 md:pb-24">
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${heroPng})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight max-w-2xl drop-shadow-lg">
            Algumas pessoas compram quadros
          </h1>
          <p className="text-white/90 text-sm mt-3 max-w-md drop-shadow">
            Outras levam perguntas para casa.
          </p>
          <Link
            href="/galeria"
            data-testid="button-ver-galeria"
            className="inline-flex items-center gap-2 mt-20 px-8 py-3 bg-primary text-white text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
          >
            Ver Galeria
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-20 bg-[hsl(40,43%,96%)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-muted-foreground leading-relaxed text-base mb-1">
              Dioleny Intya, artista plástico angolano reconhecido pela UNAP, e amplamente conhecido como “O Abstrato Doido".            </p>
            <Link
              href="/sobre"
              data-testid="button-saber-mais"
              className="inline-flex items-center gap-2 mt-8 text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity"
            >
              Sobre o artista
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={artistPng}
              alt="O Abstrato Doido no atelier"
              className="w-full aspect-[4/3] object-cover"
              data-testid="img-artist"
            />
          </div>
        </div>
      </section>

      {/* Gallery highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              
              <h2 className="font-serif text-3xl text-foreground">Destaques da Galeria</h2>
            </div>
            <Link
              href="/galeria"
              className="text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity hidden md:inline-flex items-center gap-1"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {obrasLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square" />
                  <Skeleton className="h-4 mt-2 w-3/4" />
                </div>
              ))}
            </div>
          ) : obras && obras.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {obras.map((obra) => (
                <ObraCard key={obra.id} obra={obra} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-16 font-serif text-lg">
              As obras serão adicionadas em breve
            </p>
          )}

          <div className="mt-8 md:hidden text-center">
            <Link href="/galeria" className="text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5">
              Ver todas as obras
            </Link>
          </div>
        </div>
      </section>

      {/* Next event banner */}
      <section className="py-20 bg-[hsl(40,43%,96%)]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Agenda</p>
          <h2 className="font-serif text-3xl text-foreground mb-8"></h2>

          {eventosLoading ? (
            <div className="border border-border p-8">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : proximoEvento ? (
            <div className="border border-border bg-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" data-testid={`card-evento-${proximoEvento.id}`}>
              <div className="flex items-start gap-6">
                {proximoEvento.imagemCapaUrl && (
                  <img
                    src={proximoEvento.imagemCapaUrl}
                    alt={proximoEvento.nome}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <span className={`text-xs px-2 py-0.5 mb-3 inline-block ${proximoEvento.tipo === "futuro" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {proximoEvento.tipo === "futuro" ? "Próximo Evento" : "Último Evento"}
                  </span>
                  <h3 className="font-serif text-xl text-foreground">{proximoEvento.nome}</h3>
                  {proximoEvento.local && (
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {proximoEvento.local}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                    <Calendar size={12} /> {proximoEvento.dataEvento}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {proximoEvento.tipo === "futuro" && (
                  <a
                    href={buildWA(`Olá, vi no seu site o evento "${proximoEvento.nome}" e gostaria de saber mais.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`button-interessado-evento-${proximoEvento.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Interessado
                  </a>
                )}
                <Link
                  href="/agenda"
                  data-testid="button-ver-agenda"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary text-sm tracking-widest uppercase hover:bg-primary/5 transition-colors whitespace-nowrap"
                >
                  Ver Agenda <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-white p-8 text-center">
              <p className="text-muted-foreground font-serif text-lg">Sem eventos agendados</p>
              <Link href="/agenda" className="text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5 mt-4 inline-block">
                Ver agenda completa
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
