import { Link } from "react-router";
import { Leaf, Gauge, Truck, ShieldCheck, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

const features = [
  {
    icon: Truck,
    title: "Frota num só lugar",
    description: "Veículos, pneus e histórico organizados para decisões mais rápidas.",
  },
  {
    icon: Gauge,
    title: "Vida útil dos pneus",
    description: "Acompanhe desgaste e viagens com uma visão clara do que precisa de atenção.",
  },
  {
    icon: ShieldCheck,
    title: "Dados seguros",
    description: "Conta protegida e informação da sua operação sempre com você.",
  },
];

export function HomePage() {
  const { isAuthenticated, authReady, user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="flex items-center transition-opacity hover:opacity-90">
              <img
                src="/brand/ecopneus-logo.png"
                alt="EcoPneus"
                className="h-9 w-auto max-w-[200px] object-contain object-left md:h-10"
                width={200}
                height={44}
              />
            </Link>
            <nav className="flex items-center gap-2 md:hidden">
              {authReady && isAuthenticated ? (
                <Link
                  to="/app"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Painel
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Entrar
                  </Link>
                  <Link to="/cadastro">
                    <Button type="button" variant="primary" className="px-3 py-2 text-sm">
                      Criar conta
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {authReady && isAuthenticated && (
            <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50/90 px-3 py-2 text-sm md:w-auto md:justify-end">
              <span className="truncate text-green-900">
                Sessão: <span className="font-medium">{user?.email}</span>
              </span>
              <Link
                to="/app"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Abrir painel
              </Link>
            </div>
          )}

          {authReady && !isAuthenticated && (
            <nav className="hidden items-center gap-2 md:flex md:gap-3">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 md:px-4"
              >
                Entrar
              </Link>
              <Link to="/cadastro">
                <Button type="button" variant="primary" className="px-4 py-2 text-sm shadow-md shadow-green-600/20 md:px-5">
                  Criar conta
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.18),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto max-w-3xl px-4 py-14 text-center md:px-6 md:py-20 lg:py-24">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 md:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-green-600" />
              Soluções sustentáveis para a sua frota
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl lg:leading-[1.1]">
              Gestão inteligente de{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                pneus e veículos
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 md:text-lg">
              Reduz custos, antecipa manutenção e alinha a operação com práticas mais sustentáveis — numa plataforma
              pensada para quem vive a estrada todos os dias.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              {authReady && isAuthenticated ? (
                <Link
                  to="/app"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-green-600/25 transition-colors hover:bg-green-700 sm:w-auto"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Ir para o painel
                </Link>
              ) : (
                <>
                  <Link to="/cadastro" className="sm:flex-initial">
                    <Button type="button" variant="primary" size="lg" className="w-full gap-2 shadow-lg shadow-green-600/25 sm:w-auto">
                      Começar grátis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login" className="sm:flex-initial">
                    <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto">
                      Já tenho conta
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Leaf className="h-4 w-4 text-green-600" />
              Menos desperdício, mais controlo operacional
            </p>
            <p className="mt-2 text-xs text-gray-400 md:text-sm">Cadastre-se e explore o painel em minutos.</p>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/80 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Porquê EcoPneus?</h2>
              <p className="mt-3 text-gray-600">
                Tudo o que precisas para acompanhar a frota e os pneus numa experiência simples e moderna.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-gray-500 md:flex-row md:px-6 md:text-left">
          <p>© {new Date().getFullYear()} EcoPneus. Soluções sustentáveis.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-gray-800">
              Entrar
            </Link>
            <Link to="/cadastro" className="hover:text-gray-800">
              Registo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
