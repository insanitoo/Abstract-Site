import { Link } from "wouter";
import { useListBlog } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Blog() {
  const { data: posts, isLoading } = useListBlog();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Pense Comigo</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Opiniões & Reflexões</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-6 border border-border bg-white p-6">
                  <Skeleton className="w-40 h-32 flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="flex flex-col gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} data-testid={`card-post-${post.id}`} className="group flex flex-col md:flex-row gap-0 border border-border bg-white hover:border-primary/40 transition-colors overflow-hidden">
                  {post.imagemCapaUrl ? (
                    <div className="md:w-56 md:flex-shrink-0 overflow-hidden">
                      <img
                        src={post.imagemCapaUrl}
                        alt={post.titulo}
                        className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="md:w-56 md:flex-shrink-0 bg-primary/10 h-48 md:h-auto flex items-center justify-center">
                      <span className="font-serif text-primary text-4xl opacity-30">A</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors leading-tight">
                        {post.titulo}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-3">
                        {post.conteudo.length > 150 ? post.conteudo.slice(0, 150) + "..." : post.conteudo}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <p className="text-xs text-muted-foreground">{formatDate(post.dataPublicacao)}</p>
                      <span className="text-xs tracking-widest uppercase text-primary flex items-center gap-1">
                        Ler mais <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-muted-foreground">Sem artigos publicados</p>
              <p className="text-muted-foreground text-sm mt-2">Volte em breve</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
