import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import artistPng from "@assets/artista.png";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">
              O Artista
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">
              Sobre O Abstrato Doido
            </h1>
          </div>
        </div>

        {/* Main photo + bio */}
        <section className="py-20 bg-[hsl(40,43%,96%)]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <img
                src={artistPng}
                alt="O Abstrato Doido no atelier"
                className="w-full aspect-[3/4] object-cover"
                data-testid="img-artist-sobre"
              />
            </div>
            <div className="pt-4">
              <p className="text-5xl font-serif text-primary leading-none mb-6">
                "
              </p>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-snug mb-8">
                Bem-vindo ao meu espaço de expressão. Crio para transcender
                barreiras.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Um miúdo de 19 anos que começou a pintar por curiosidade... Hoje
                vive da própria arte.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Não sei bem como aconteceu, mas sei que não aconteceu sozinho.
              </p>
            </div>
          </div>
        </section>

        {/* A Minha História */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-serif text-3xl text-primary mb-6">
              A Minha História
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Comecei a pintar na adolescência, movido pela necessidade de
              expressar aquilo que as palavras não alcançavam. Cresci a observar
              as cores das ruas, das pessoas, das memórias — e percebi que a
              arte abstrata era o único idioma suficientemente vasto para tudo
              isso.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ao longo dos anos, expus em galerias em Angola, Portugal e Brasil,
              participei em residências artísticas e desenvolvi uma linguagem
              visual própria — densa, cromática, e profundamente emocional.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Hoje, trabalho a partir do meu atelier em Luanda, criando obras de
              grande formato que desafiam o olhar e convidam à contemplação.
            </p>
          </div>
        </section>

        {/* O Processo Criativo */}
        <section className="py-20 bg-[hsl(40,43%,96%)]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-serif text-3xl text-foreground mb-6">
              O Processo Criativo
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Começar a pintar é uma jornada onde cada pincelada pode mudar
              tudo. Não trabalho com esboços — o processo é intuitivo, guiado
              pela emoção do momento e pela energia do espaço.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Uso tintas acrílicas e óleo, espátulas e os próprios dedos. O
              corpo todo participa na criação. Cada obra nasce de uma série de
              camadas, cada uma com a sua história, invisível mas presente.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O caos é parte do método. Acredito que a obra perfeita é a que
              surpreende o próprio artista.
            </p>
          </div>
        </section>

        {/* A Filosofia das Cores */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-3xl text-foreground mb-12 text-center">
              A Filosofia das Cores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 flex-shrink-0 bg-primary flex items-center justify-center">
                  <span className="text-white font-serif text-xs text-center leading-tight px-1">
                    Verde
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-primary mb-2">
                    Verde — Harmonia
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    O verde que atravessa grande parte das minhas obras
                    representa a harmonia entre o artista e a natureza, entre o
                    caos e a ordem. É a cor que ancora, que equilibra, que
                    respira.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 flex-shrink-0 bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-serif text-xs text-center leading-tight px-1">
                    Laranja
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-orange-600 mb-2">
                    Laranja — Energia
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    O laranja irrompe nas telas como um grito de vitalidade. É a
                    cor da ação, do desejo, da transformação. Quando o laranja
                    aparece, é porque há algo urgente a dizer.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 flex-shrink-0 bg-blue-900 flex items-center justify-center">
                  <span className="text-white font-serif text-xs text-center leading-tight px-1">
                    Azul
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-blue-900 mb-2">
                    Azul Profundo — Silêncio
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    O azul profundo é a meditação. É o espaço entre os sons, o
                    instante antes do gesto. Nas minhas obras, o azul convida ao
                    mergulho interior.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 flex-shrink-0 bg-yellow-600 flex items-center justify-center">
                  <span className="text-white font-serif text-xs text-center leading-tight px-1">
                    Dourado
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-yellow-700 mb-2">
                    Dourado — Transcendência
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    O dourado é raro nas minhas telas — e por isso, quando
                    aparece, é sagrado. É a luz que atravessa, o momento de
                    graça que a arte pode capturar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bastidores */}
        <section className="py-20 bg-[hsl(40,43%,96%)]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-3xl text-foreground mb-10 text-center">
              Bastidores do Atelier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <img
                src={artistPng}
                alt="Atelier 1"
                className="w-full aspect-square object-cover"
              />
              <img
                src={artistPng}
                alt="Atelier 2"
                className="w-full aspect-square object-cover md:translate-y-8"
              />
              <img
                src={artistPng}
                alt="Atelier 3"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
