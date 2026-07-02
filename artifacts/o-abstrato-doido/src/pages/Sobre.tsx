import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import artistPng from "@assets/image_1782859145516.png";
import artistaisPng from "@assets/artista.png";
import artistais2Png from "@assets/image_1782860231531.png";

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
                Bem-vindo ao meu espaço de expressão.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Dioleny Intya, 23 anos, Angola.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Artista plástico abstrato. Não pinto paisagens bonitas nem
                coisas fáceis de entender à primeira vista. Pinto relações
                humanas, aquelas que não se explicam bem, mas
                também não se calam.
              </p>
            </div>
          </div>
        </section>

        {/* A Minha História */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-serif text-3xl text-primary mb-6">
              Manifesto Artístico
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Eu não pinto porque entendi a vida. Pinto porque claramente não entendi.
              A verdade é simples: somos imperfeitos. E não é um defeito do sistema. É o
              sistema.
              Enquanto toda gente anda numa corrida meio desesperada para “evoluir”,
              “crescer”, “se tornar melhor”… eu olho para isso e penso: melhor em relação a quê
              exatamente?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O meu trabalho nasce desse incômodo.
              De um lado, tens a Bíblia a falar de sabedoria, disciplina, propósito. Do outro, tens
              a vida real: gente cansada, atrasada, confusa, a tentar lembrar se já lavou os
              pratos ou se esqueceu o pão.
              E, curiosamente, tudo isso coexistindo sem pedir autorização.
              Eu pinto esse meio.
              Esse espaço onde a pessoa quer ser extraordinária… mas ainda está a tentar
              acordar antes das 9h.
              Onde se fala de propósito… mas também de preguiça.
              De espiritualidade… mas também de distração.
              Nada disso é contradição. É só humano.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Uso a abstração porque seria ridículo tentar explicar isso de forma direta. Não
              cabe. Escapa. Mistura.
              As cores, as formas, as camadas — tudo ali é meio desorganizado de propósito.
              Porque a vida também é.
              E tem mais: eu gosto de ironizar isso tudo.
              Não como quem desrespeita… mas como quem percebe que levar tudo
              demasiado a sério também é uma forma de ilusão.
              No fundo, o meu trabalho não tenta corrigir nada.
              Só olha e diz:
              “é isso mesmo… e já chega.”
              Se alguém vê beleza nisso, ótimo.
              Se vê confusão, melhor ainda.
              Porque provavelmente é a mesma coisa.
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <img
                src={artistPng}
                alt="Atelier 1"
                className="w-full aspect-square object-cover"
              />
              <img
                src={artistaisPng}
                alt="Atelier 2"
                className="w-full aspect-square object-cover md:translate-y-8"
              />
              <img
                src={artistais2Png}
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
