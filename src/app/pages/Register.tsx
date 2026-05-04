import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, User, Building2, FileText, Truck, Car, Bike } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

type UserType = "individual" | "company";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("individual");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
  });
  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    password: false,
    companyName: false,
    cnpj: false,
  });

  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    const newErrors = {
      fullName: !formData.fullName,
      email: !formData.email || !formData.email.includes("@"),
      password: !formData.password || formData.password.length < 6,
      companyName: userType === "company" && !formData.companyName,
      cnpj: userType === "company" && !formData.cnpj,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some((v) => v)) {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType,
        companyName: formData.companyName || undefined,
      });
      if (!result.ok) {
        setFeedback({ type: "err", text: result.error ?? "Não foi possível cadastrar." });
        return;
      }
      if (result.error) {
        setFeedback({ type: "ok", text: result.error });
        return;
      }
      navigate("/");
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
              Junte-se à revolução da gestão inteligente
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              2 usuários já otimizam custos e aumentam a eficiência com o EcoPneu
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-lg">Controle total de custos e manutenção</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-lg">Relatórios detalhados e insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-lg">Gestão de múltiplos veículos</span>
            </div>
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

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-4 md:py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 md:mb-8 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">EcoPneu</h1>
            </div>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
              <p className="text-sm md:text-base text-gray-600">Comece a gerenciar seus veículos hoje</p>
            </div>

            {feedback && (
              <div
                className={`mb-4 rounded-xl border p-3 text-sm ${
                  feedback.type === "ok"
                    ? "bg-green-50 border-green-200 text-green-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* User Type Selection */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                  Tipo de usuário
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("individual")}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                      userType === "individual"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <User className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2" />
                    <div className="text-xs md:text-sm font-medium">Pessoa física</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("company")}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                      userType === "company"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2" />
                    <div className="text-xs md:text-sm font-medium">Empresa</div>
                  </button>
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="João Silva"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">Nome é obrigatório</p>
                )}
              </div>

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

              {/* Company Fields - Show only if company is selected */}
              {userType === "company" && (
                <>
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da empresa
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Transportadora XYZ Ltda"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.companyName
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                        }`}
                      />
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">Nome da empresa é obrigatório</p>
                    )}
                  </div>

                  {/* CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.cnpj
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                        }`}
                      />
                    </div>
                    {errors.cnpj && (
                      <p className="mt-1 text-sm text-red-600">CNPJ é obrigatório</p>
                    )}
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Concordo com os{" "}
                    <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                      Política de Privacidade
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" className="w-full py-2.5 md:py-3 text-sm md:text-base">
                Criar conta
              </Button>

              {/* Divider */}
              <div className="relative my-4 md:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs md:text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-xs md:text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                    Entrar
                  </Link>
                </span>
              </div>
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
