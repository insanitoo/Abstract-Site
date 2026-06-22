import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ImageIcon, CalendarIcon, FileTextIcon, ExternalLink, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/obras", label: "Obras", icon: ImageIcon },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarIcon },
  { href: "/admin/blog", label: "Blog", icon: FileTextIcon },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: me, isLoading, error } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });

  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !me && error) {
      setLocation("/admin/login");
    }
  }, [isLoading, me, error, setLocation]);

  function handleLogout() {
    logout.mutate(
      undefined,
      {
        onSuccess: () => {
          queryClient.clear();
          setLocation("/admin/login");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-foreground text-white flex-shrink-0 flex flex-col">
        <div className="px-6 py-8 border-b border-white/10">
          <p className="font-serif text-base text-white">O Abstrato Doido</p>
          <p className="text-xs text-white/50 mt-0.5 tracking-widest uppercase">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`nav-admin-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                location === href || location.startsWith(href)
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
            data-testid="link-ver-site"
          >
            <ExternalLink size={16} />
            Ver Site
          </a>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors w-full text-left"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
