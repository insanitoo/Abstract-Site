import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Campo obrigatório"),
  password: z.string().min(1, "Campo obrigatório"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const login = useLogin();

  function onSubmit(values: LoginValues) {
    login.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          setLocation("/admin/obras");
        },
        onError: () => {
          toast({ title: "Credenciais inválidas", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40,43%,96%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-[hsl(40,10%,85%)] p-10">
        <h1 className="font-serif text-2xl text-foreground mb-1">Painel Admin</h1>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-8">O Abstrato Doido</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-foreground">Utilizador</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="admin"
                      data-testid="input-username"
                      className="border-[hsl(40,10%,85%)] focus:ring-foreground rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-foreground">Palavra-passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-password"
                      className="border-[hsl(40,10%,85%)] focus:ring-foreground rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={login.isPending}
              data-testid="button-login"
              className="w-full bg-foreground text-white hover:bg-foreground/90 rounded-none tracking-widest uppercase text-xs"
            >
              {login.isPending ? "A entrar..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
