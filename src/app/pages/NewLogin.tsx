import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, Truck, Car, Bike, AlertCircle } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

export function NewLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({ email: false, password: false, login: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const newErrors = {
      email: !formData.email || !formData.email.includes("@"),
      password: !formData.password || formData.password.length < 6,
      login: false,
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      // Tentar fazer login
      const success = login(formData.email, formData.password);

      if (success) {
        navigate("/");
      } else {
        setErrors({ ...newErrors, login: true });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-green-400 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white">EcoPneu</h1>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Gerencie seus veículos com inteligência
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Controle custos, viagens e manutenção em um só lugar
            </p>
          </div>

          {/* Vehicle Icons */}
          <div className="flex gap-6 pt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-white/90 font-medium">Caminhões</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Car className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-white/90 font-medium">Carros</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-white/90 font-medium">Motos</span>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10">
          <p className="text-white/80 text-sm">
            Plataforma completa de gestão de frota e veículos
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 md:mb-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">EcoPneu</h1>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Entrar</h2>
              <p className="text-sm md:text-base text-gray-600">Acesse sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Login Error Message */}
              {errors.login && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Email ou senha incorretos</p>
                    <p className="text-xs text-red-600 mt-1">Verifique suas credenciais e tente novamente.</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">Email inválido</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">Senha deve ter no mínimo 6 caracteres</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Lembrar de mim</span>
                </label>
                <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                  Esqueci minha senha
                </a>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" className="w-full py-2.5 md:py-3 text-sm md:text-base">
                Entrar
              </Button>

              {/* Divider */}
              <div className="relative my-5 md:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs md:text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link to="/cadastro">
                <Button type="button" variant="secondary" className="w-full py-2.5 md:py-3 text-sm md:text-base">
                  Criar conta
                </Button>
              </Link>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs md:text-sm text-gray-600 mt-4 md:mt-6">
            © 2026 EcoPneu. Gestão inteligente de veículos.
          </p>
        </div>
      </div>
    </div>
  );
}
