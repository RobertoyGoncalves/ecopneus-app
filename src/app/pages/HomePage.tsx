import { Link } from "react-router";
import {
  Leaf,
  Gauge,
  CircleDot,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  Car,
  Map as MapIcon,
  BarChart3,
  Recycle,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Users,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#sustentabilidade", label: "Sustentabilidade" },
  { href: "#faq", label: "FAQ" },
];

const stats = [
  { value: "40%", label: "menos tempo em relatórios", icon: Clock },
  { value: "3x", label: "visibilidade do desgaste", icon: Gauge },
  { value: "100%", label: "dados da frota centralizados", icon: Car },
];

const features = [
  {
    icon: CircleDot,
    title: "Frota em um só lugar",
    description: "Veículos, pneus e histórico organizados para decisões mais rápidas e menos surpresas na estrada.",
    accent: "from-green-500 to-emerald-600",
  },
  {
    icon: Gauge,
    title: "Vida útil dos pneus",
    description: "Acompanhe desgaste e quilometragem com alertas visuais sobre o que precisa de atenção imediata.",
    accent: "from-blue-500 to-cyan-600",
  },
  {
    icon: MapIcon,
    title: "Viagens registradas",
    description: "Histórico de trajetos ligado à frota para correlacionar uso, custos e desempenho operacional.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Dashboard inteligente",
    description: "Indicadores em tempo real sobre saúde dos pneus, frota ativa e atividade recente da operação.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Dados seguros",
    description: "Conta protegida com acesso controlado — as informações da sua operação ficam sempre com você.",
    accent: "from-slate-600 to-gray-800",
  },
  {
    icon: Recycle,
    title: "Gestão sustentável",
    description: "Prolongue a vida útil dos pneus e reduza desperdício com decisões baseadas em dados concretos.",
    accent: "from-teal-500 to-green-700",
  },
];

const steps = [
  {
    step: "01",
    title: "Crie sua conta",
    description: "Cadastro rápido em poucos minutos. Sem cartão de crédito para começar a explorar.",
  },
  {
    step: "02",
    title: "Cadastre a frota",
    description: "Adicione veículos, pneus e viagens. A plataforma organiza tudo em um painel unificado.",
  },
  {
    step: "03",
    title: "Tome decisões melhores",
    description: "Use indicadores e alertas para planejar manutenção, reduzir custos e operar com mais sustentabilidade.",
  },
];

const testimonials = [
  {
    quote:
      "Finalmente temos visibilidade sobre o desgaste dos pneus antes de virar emergência na estrada. O painel nos poupou horas de planilhas.",
    author: "Miguel R.",
    role: "Gestor de frota — Transportes",
    rating: 5,
  },
  {
    quote:
      "A EcoPneus alinhou nossa operação com metas de sustentabilidade sem complicar o dia a dia dos motoristas.",
    author: "Ana S.",
    role: "Diretora de operações — Logística",
    rating: 5,
  },
  {
    quote:
      "Interface clara, dados centralizados e equipe adotando em dias. Recomendo para quem gerencia frotas de médio porte.",
    author: "Carlos F.",
    role: "Proprietário — Distribuição regional",
    rating: 5,
  },
];

const faqs = [
  {
    q: "A EcoPneus é gratuita para começar?",
    a: "Sim. Você pode criar conta e explorar o painel sem compromisso. Ideal para conhecer a plataforma antes de escalar com sua frota.",
  },
  {
    q: "Preciso instalar software nos veículos?",
    a: "Não. A plataforma funciona no navegador — computador, tablet ou celular. Basta cadastrar veículos, pneus e viagens manualmente ou importar conforme seu fluxo.",
  },
  {
    q: "Quantos veículos posso gerenciar?",
    a: "A arquitetura suporta desde frotas pequenas até operações em crescimento. Comece com o que tem hoje e expanda conforme a equipe adota a ferramenta.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. O acesso é protegido por autenticação e cada conta vê apenas as informações da sua operação.",
  },
];

function HeroDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-green-400/20 via-emerald-500/10 to-blue-500/10 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/90 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-xs font-medium text-gray-500">painel.ecopneus.app</span>
        </div>
        <div className="grid grid-cols-12 gap-0 bg-[#f8f9fa]">
          <div className="col-span-3 hidden border-r border-gray-200 bg-[#1f2937] p-3 sm:block">
            <div className="mb-4 h-6 w-20 rounded bg-white/90" />
            {["Dashboard", "Veículos", "Pneus", "Viagens"].map((label, i) => (
              <div
                key={label}
                className={`mb-1.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] ${
                  i === 0 ? "bg-green-600 text-white" : "text-gray-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {label}
              </div>
            ))}
          </div>
          <div className="col-span-12 p-4 sm:col-span-9">
            <p className="text-xs font-semibold text-gray-900">Visão geral da frota</p>
            <p className="text-[10px] text-gray-500">Atualizado há instantes</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Veículos", val: "24", color: "text-blue-600 bg-blue-50" },
                { label: "Pneus", val: "96", color: "text-green-600 bg-green-50" },
                { label: "Saúde média", val: "78%", color: "text-emerald-600 bg-emerald-50" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                  <p className="text-[9px] text-gray-500">{k.label}</p>
                  <p className={`text-sm font-bold ${k.color.split(" ")[0]}`}>{k.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium text-gray-700">Saúde dos pneus</p>
              <div className="mt-2 flex h-16 items-end justify-between gap-1">
                {[72, 88, 45, 91, 60, 78].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-2 py-1.5">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-[10px] font-medium text-green-800">−12% custos de substituição este trimestre</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Alerta preventivo</p>
            <p className="text-[10px] text-gray-500">3 pneus abaixo de 50% saúde</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthNavLinks({
  authReady,
  isAuthenticated,
  className = "",
  onNavigate,
}: {
  authReady: boolean;
  isAuthenticated: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  if (!authReady) return null;

  if (isAuthenticated) {
    return (
      <Link
        to="/app"
        onClick={onNavigate}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-colors hover:bg-green-700 ${className}`}
      >
        <LayoutDashboard className="h-4 w-4" />
        Abrir painel
      </Link>
    );
  }

  return (
    <>
      <Link
        to="/login"
        onClick={onNavigate}
        className={`rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 ${className}`}
      >
        Entrar
      </Link>
      <Link to="/cadastro" onClick={onNavigate}>
        <Button type="button" variant="primary" className="px-4 py-2 text-sm shadow-md shadow-green-600/20">
          Criar conta grátis
        </Button>
      </Link>
    </>
  );
}

export function HomePage() {
  const { isAuthenticated, authReady, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryCta = authReady && isAuthenticated ? (
    <Link
      to="/app"
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-700 hover:shadow-xl sm:w-auto"
    >
      <LayoutDashboard className="h-5 w-5" />
      Ir para o painel
    </Link>
  ) : (
    <>
      <Link to="/cadastro" className="w-full sm:w-auto">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full gap-2 shadow-lg shadow-green-600/25 sm:min-w-[200px]"
        >
          Começar grátis
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link to="/login" className="w-full sm:w-auto">
        <Button type="button" variant="secondary" size="lg" className="w-full sm:min-w-[160px]">
          Já tenho conta
        </Button>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen scroll-smooth bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100/80 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6 lg:py-4">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <BrandLogo className="h-9 w-auto max-w-[200px] md:h-10" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <AuthNavLinks authReady={authReady} isAuthenticated={isAuthenticated} />
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
              <AuthNavLinks
                authReady={authReady}
                isAuthenticated={isAuthenticated}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {authReady && isAuthenticated && (
          <div className="border-t border-green-100 bg-green-50/80 px-4 py-2 md:px-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-sm">
              <span className="truncate text-green-900">
                Sessão ativa: <span className="font-medium">{user?.email}</span>
              </span>
              <Link
                to="/app"
                className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-green-700 hover:text-green-800"
              >
                Continuar no painel
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(34,197,94,0.22),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Controle total da sua frota com{" "}
                <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  inteligência e sustentabilidade
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg lg:mx-0">
                Reduza custos operacionais, antecipe a manutenção de pneus e centralize veículos, viagens e indicadores
                em um painel moderno — pensado para quem vive a estrada todos os dias.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
                {primaryCta}
              </div>
              <ul className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                {["Sem cartão para começar", "Configuração em minutos", "Suporte em português"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <HeroDashboardPreview />
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-100 bg-gray-50/60" aria-label="Indicadores">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 md:px-6 md:py-14">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{value}</p>
                <p className="mt-1 max-w-[200px] text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Funcionalidades</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Tudo que sua operação precisa
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Da garagem à estrada: ferramentas integradas para gestores que querem eficiência sem complexidade.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, accent }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-100 hover:shadow-lg hover:shadow-green-600/5"
                >
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="border-t border-gray-100 bg-gray-50/80 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Como funciona</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Três passos para transformar a gestão
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map(({ step, title, description }, index) => (
                <div key={step} className="relative text-center md:text-left">
                  {index < steps.length - 1 && (
                    <div
                      className="absolute top-8 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-green-300 to-transparent md:block"
                      aria-hidden
                    />
                  )}
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-lg font-bold text-white shadow-lg shadow-green-600/30">
                    {step}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              {!isAuthenticated && authReady && (
                <Link to="/cadastro">
                  <Button type="button" variant="primary" size="lg" className="gap-2 shadow-lg shadow-green-600/20">
                    Começar agora — é grátis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Sustainability */}
        <section id="sustentabilidade" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 shadow-2xl">
              <div className="grid items-center gap-10 p-8 md:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
                <div>
                  <h2 className="text-3xl font-bold text-white md:text-4xl">
                    Menos desperdício. Mais quilômetros com o mesmo pneu.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-gray-300">
                    Cada pneu substituído antes do tempo representa custo e impacto ambiental. A EcoPneus ajuda a
                    prolongar a vida útil com dados que tornam a sustentabilidade uma decisão de negócio — não apenas
                    um discurso.
                  </p>
                  <ul className="mt-8 space-y-4">
                    {[
                      "Monitoramento contínuo do desgaste",
                      "Relatórios para equipes e stakeholders",
                      "Redução de paradas não planejadas",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-200">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Recycle, label: "Pneus reutilizados por mais tempo", value: "+18%" },
                    { icon: TrendingDown, label: "Redução de custos operacionais", value: "−12%" },
                    { icon: Users, label: "Equipes com visão compartilhada", value: "1 painel" },
                    { icon: Leaf, label: "Menor pegada por km rodado", value: "Eco" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                      <Icon className="h-6 w-6 text-green-400" />
                      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
                      <p className="mt-1 text-xs leading-snug text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-gray-100 bg-gray-50/80 py-20 md:py-28" aria-label="Depoimentos">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Depoimentos</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Quem gerencia frotas confia na EcoPneus
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map(({ quote, author, role, rating }) => (
                <blockquote
                  key={author}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-700">&ldquo;{quote}&rdquo;</p>
                  <footer className="mt-6 border-t border-gray-100 pt-4">
                    <p className="font-semibold text-gray-900">{author}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-600">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Perguntas frequentes</h2>
            </div>
            <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group px-5 py-1 first:rounded-t-2xl last:rounded-b-2xl">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-gray-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 md:pb-28" aria-label="Chamada para ação">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 px-6 py-14 text-center shadow-2xl shadow-green-900/20 md:px-12 md:py-16">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"
                aria-hidden
              />
              <div className="relative">
                <h2 className="text-3xl font-bold text-white md:text-4xl">Pronto para modernizar a gestão da frota?</h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/90 md:text-lg">
                  Junte-se à EcoPneus e leve sustentabilidade, controle e eficiência para o dia a dia da sua operação.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {authReady && isAuthenticated ? (
                    <Link
                      to="/app"
                      className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-green-700 shadow-lg transition-colors hover:bg-green-50 sm:w-auto"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Abrir painel de gestão
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/cadastro"
                        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-green-700 shadow-lg transition-colors hover:bg-green-50 sm:w-auto"
                      >
                        Criar conta grátis
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-white/40 px-8 py-3 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
                      >
                        Entrar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <BrandLogo elevated className="h-9 w-auto max-w-[200px]" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                EcoPneus — soluções sustentáveis para gestão de frotas, pneus e operações rodoviárias com inteligência
                de dados.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Plataforma</p>
              <ul className="mt-4 space-y-2 text-sm">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <a href={href} className="transition-colors hover:text-white">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Conta</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link to="/login" className="transition-colors hover:text-white">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to="/cadastro" className="transition-colors hover:text-white">
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link to="/app" className="transition-colors hover:text-white">
                    Painel
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-center text-xs md:flex-row md:text-left">
            <p>© {new Date().getFullYear()} EcoPneus. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-green-500" />
              Gestão sustentável de frotas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
