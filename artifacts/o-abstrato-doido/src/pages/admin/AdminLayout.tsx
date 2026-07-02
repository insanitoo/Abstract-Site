import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ImageIcon, CalendarIcon, FileTextIcon, ExternalLink, LogOut, Menu, X, GraduationCap, Tag, ListOrdered } from "lucide-react";

const navItems = [
  { href: "/odoido/obras", label: "Obras", icon: ImageIcon },
  { href: "/odoido/ordem", label: "Ordem / Destaque", icon: ListOrdered },
  { href: "/odoido/descontos", label: "Descontos", icon: Tag },
  { href: "/odoido/eventos", label: "Eventos", icon: CalendarIcon },
  { href: "/odoido/blog", label: "Blog", icon: FileTextIcon },
  { href: "/odoido/cursos", label: "Cursos", icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: me, isLoading, error } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });

  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !me && error) {
      setLocation("/odoido/login");
    }
  }, [isLoading, me, error, setLocation]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/odoido/login");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  if (!me) return null;

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="font-serif text-base text-white">Intya Space</p>
          <p className="text-xs text-white/50 mt-0.5 tracking-widest uppercase">Painel Administrativo</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white/60 hover:text-white"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            data-testid={`nav-admin-${label.toLowerCase()}`}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm transition-colors rounded-sm ${
              location === href || location.startsWith(href)
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            <span className="text-base">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors"
          data-testid="link-ver-site"
        >
          <ExternalLink size={18} />
          <span className="text-base">Ver Site</span>
        </a>
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-base">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-56 bg-foreground text-white flex-shrink-0 flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden flex items-center gap-4 px-4 py-4 bg-white border-b border-[hsl(40,10%,85%)] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground p-1"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <p className="font-serif text-base text-foreground">O Abstrato Doido</p>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
