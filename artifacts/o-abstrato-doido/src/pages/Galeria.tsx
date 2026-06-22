import { useState } from "react";
import { useListObras } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "todas" | "disponivel" | "vendido";

const WA = "244934959424";

function buildWA(titulo: string) {
  const msg = encodeURIComponent(
    `Olá, vi no seu site que a obra "${titulo}" ainda está disponível... Gostaria de comprá-la.`
  );
  return `https://wa.me/${WA}?text=${msg}`;
}

export default function Galeria() {
  const [filter, setFilter] = useState<StatusFilter>("todas");
  const { data: obras, isLoading } = useListObras(filter !== "todas" ? { status: filter } : undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Colecção</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Galeria</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-[hsl(40,43%,96%)]/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-1 flex-wrap">
            <span className="text-xs tracking-widest uppercase text-muted-foreground mr-3">Filtrar por:</span>
            {(["todas", "disponivel", "vendido"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-testid={`button-filter-${f}`}
                className={`px-5 py-1.5 text-xs tracking-widest uppercase transition-colors ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "todas" ? "Todas" : f === "disponivel" ? "Disponíveis" : "Vendidas"}
              </button>
            ))}
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
          ) : obras && obras.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {obras.map((obra) => (
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
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-base text-foreground leading-tight">{obra.titulo}</p>
                    {obra.dimensoes && (
                      <p className="text-xs text-muted-foreground mt-1">{obra.dimensoes}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs flex items-center gap-1 ${obra.status === "disponivel" ? "text-primary" : "text-muted-foreground"}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${obra.status === "disponivel" ? "bg-primary" : "bg-muted-foreground"}`} />
                        {obra.status === "disponivel" ? "Disponível" : "Vendido"}
                      </span>
                      {obra.status === "disponivel" && (
                        <a
                          href={buildWA(obra.titulo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`button-interessado-${obra.id}`}
                          className="text-xs px-3 py-1 bg-primary text-white hover:bg-primary/90 transition-colors tracking-wide"
                        >
                          Interessado
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-muted-foreground">Nenhuma obra encontrada</p>
              <button
                onClick={() => setFilter("todas")}
                className="mt-4 text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
