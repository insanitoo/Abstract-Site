import { Mail, Phone, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[hsl(155,46%,33%)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-serif text-xl mb-4 text-white/90">Contactos</h3>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:geral@oabstratodoido.pt"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
              data-testid="link-email"
            >
              <Mail size={16} />
              geral@oabstratodoido.pt
            </a>
            <a
              href="tel:+351912345678"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
              data-testid="link-phone"
            >
              <Phone size={16} />
              +351 912 345 678
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-xl mb-4 text-white/90">Redes Sociais</h3>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/oabstratodoido"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              data-testid="link-instagram"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://youtube.com/@oabstratodoido"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              data-testid="link-youtube"
              aria-label="YouTube"
            >
              <Youtube size={22} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-white/50 text-xs">
        © {new Date().getFullYear()} O Abstrato Doido. Todos os direitos reservados.
      </div>
    </footer>
  );
}
