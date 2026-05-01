import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, CircleDot } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CircleDot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white">EcoPneu</h1>
              <p className="text-sm text-white/80">Gestão Sustentável de Frotas</p>
            </div>
          </div>

          <div className="max-w-md mt-20">
            <h2 className="text-4xl font-semibold text-white mb-6">
              Controle sua frota de forma inteligente
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Reduza custos, aumente a eficiência e promova a sustentabilidade com tecnologia de ponta.
            </p>

            <div className="space-y-4 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
                <span>Monitoramento em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
                <span>Análise de desempenho completa</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
                <span>Relatórios detalhados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#22c55e] rounded-xl flex items-center justify-center">
                <CircleDot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">EcoPneu</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Acesse sua conta</h2>
            <p className="text-gray-600">Gerencie sua frota de forma inteligente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                />
                <span className="text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-[#22c55e] hover:text-[#16a34a] transition-colors">
                Esqueci minha senha
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Entrar
            </Button>

            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="#" className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors">
                Criar conta
              </a>
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
