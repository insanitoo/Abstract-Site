import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Galeria from "@/pages/Galeria";
import Agenda from "@/pages/Agenda";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Sobre from "@/pages/Sobre";
import Cursos from "@/pages/Cursos";
import Login from "@/pages/admin/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import ObrasAdmin from "@/pages/admin/ObrasAdmin";
import EventosAdmin from "@/pages/admin/EventosAdmin";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import CursosAdmin from "@/pages/admin/CursosAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/galeria" component={Galeria} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/sobre" component={Sobre} />
      <Route path="/cursos" component={Cursos} />
      <Route path="/odoido/login" component={Login} />
      <Route path="/odoido" component={() => <AdminLayout><ObrasAdmin /></AdminLayout>} />
      <Route path="/odoido/obras" component={() => <AdminLayout><ObrasAdmin /></AdminLayout>} />
      <Route path="/odoido/eventos" component={() => <AdminLayout><EventosAdmin /></AdminLayout>} />
      <Route path="/odoido/blog" component={() => <AdminLayout><BlogAdmin /></AdminLayout>} />
      <Route path="/odoido/cursos" component={() => <AdminLayout><CursosAdmin /></AdminLayout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
