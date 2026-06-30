import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  User,
  Lock,
  Bell,
  SlidersHorizontal,
  Database,
  Info,
  Shield,
  Download,
  Camera,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { SwitchToggle } from "../components/ui/SwitchToggle";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { exportTripsToExcel, exportFleetToExcel } from "../lib/exportUtils";
import type { TireQualityTier } from "../domain/wearModel";

// ─── Constants ────────────────────────────────────────────────────────────────
const THEME_KEY = "ecopneus-theme";
const UNIT_KEY = "ecopneus-unit";
const NOTIF_KEY = "ecopneus-notifications";
const FLEET_DEFAULTS_KEY = "ecopneus-fleet-defaults";
const PHONE_KEY = "ecopneus-profile-phone";
export const AVATAR_KEY = "ecopneus-avatar-url";

const selectCls =
  "h-11 w-full rounded-xl border px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  iconBg = "bg-green-100",
  iconColor = "text-green-700",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h3
              className="text-base font-semibold md:text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Toggle row helper ────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      <SwitchToggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Settings() {
  const { user, supabaseUserId } = useAuth();
  const { vehicles, tires } = useFleet();
  const { trips } = useTrips();

  // ── Section 1: Profile ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [company, setCompany] = useState(user?.companyName ?? "");
  const [phone, setPhone] = useState(() => localStorage.getItem(PHONE_KEY) ?? "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => localStorage.getItem(AVATAR_KEY)
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setCompany(user?.companyName ?? "");
  }, [user]);

  // Fetch avatar_url from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabaseUserId) return;
    void getSupabase()
      .from("profiles")
      .select("avatar_url")
      .eq("id", supabaseUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url as string);
          localStorage.setItem(AVATAR_KEY, data.avatar_url as string);
        }
      });
  }, [supabaseUserId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseUserId) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2 MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${supabaseUserId}/avatar.${ext}`;
      const supabase = getSupabase();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", supabaseUserId);

      if (updateError) throw updateError;

      setAvatarUrl(url);
      localStorage.setItem(AVATAR_KEY, url);
      // Notify Sidebar (same tab) via storage event simulation
      window.dispatchEvent(new StorageEvent("storage", { key: AVATAR_KEY, newValue: url }));
      toast.success("Foto de perfil atualizada.");
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      console.error("Erro detalhado:", err);
      console.error("Mensagem:", e?.message);
      console.error("Status:", e?.status);
      alert(`Erro: ${(e?.message as string) || JSON.stringify(err)}`);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getUserInitials = () => {
    const name = fullName || user?.fullName || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    localStorage.setItem(PHONE_KEY, phone);

    if (isSupabaseConfigured() && supabaseUserId) {
      const { error } = await getSupabase()
        .from("profiles")
        .update({ full_name: fullName.trim(), company_name: company.trim() })
        .eq("id", supabaseUserId);

      if (error) {
        toast.error("Erro ao salvar perfil: " + error.message);
        setProfileSaving(false);
        return;
      }
    }

    toast.success("Perfil atualizado com sucesso.");
    setProfileSaving(false);
  };

  // ── Section 2: Preferences ──────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">(
    () => (localStorage.getItem(UNIT_KEY) as "km" | "mi") ?? "km"
  );

  const handleDarkToggle = (val: boolean) => {
    setIsDark(val);
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, val ? "dark" : "light");
    toast.success(val ? "Modo escuro ativado." : "Modo claro ativado.");
  };

  const handleUnitChange = (val: "km" | "mi") => {
    setDistanceUnit(val);
    localStorage.setItem(UNIT_KEY, val);
    toast.success("Preferência de unidade salva.");
  };

  // ── Section 3: Notifications ────────────────────────────────────────────────
  const parseNotif = () => {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  };

  const [notif, setNotif] = useState<{
    criticalTire: boolean;
    maintenance: boolean;
    weeklySummary: boolean;
  }>(() => {
    const n = parseNotif();
    return {
      criticalTire: n.criticalTire ?? true,
      maintenance: n.maintenance ?? true,
      weeklySummary: n.weeklySummary ?? false,
    };
  });

  const handleNotifChange = (key: keyof typeof notif, val: boolean) => {
    const next = { ...notif, [key]: val };
    setNotif(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  // ── Section 4: Fleet Defaults ───────────────────────────────────────────────
  const parseFleetDefaults = () => {
    try {
      return JSON.parse(localStorage.getItem(FLEET_DEFAULTS_KEY) ?? "{}") as Record<string, string>;
    } catch {
      return {};
    }
  };

  const [fleetDefaults, setFleetDefaults] = useState<{
    defaultTier: TireQualityTier;
    weightUnit: "kg" | "t";
  }>(() => {
    const d = parseFleetDefaults();
    return {
      defaultTier: (d.defaultTier as TireQualityTier) ?? "intermediario",
      weightUnit: (d.weightUnit as "kg" | "t") ?? "t",
    };
  });

  const handleFleetDefaultChange = (key: keyof typeof fleetDefaults, val: string) => {
    const next = { ...fleetDefaults, [key]: val };
    setFleetDefaults(next as typeof fleetDefaults);
    localStorage.setItem(FLEET_DEFAULTS_KEY, JSON.stringify(next));
    toast.success("Padrão da frota salvo.");
  };

  // ── Section 5: Security ─────────────────────────────────────────────────────
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setPasswordSaving(true);

    if (isSupabaseConfigured()) {
      const { error } = await getSupabase().auth.updateUser({ password: newPassword });
      if (error) {
        toast.error("Erro ao trocar senha: " + error.message);
        setPasswordSaving(false);
        return;
      }
    }

    toast.success("Senha alterada com sucesso.");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaving(false);
    setPasswordModalOpen(false);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeleteAccount = () => {
    // TODO: implement actual account deletion
    // Steps would be:
    // 1. Delete all user data from Supabase (trips, fleet, profiles)
    // 2. Call supabase.auth.admin.deleteUser(supabaseUserId) — requires service role
    //    or supabase.rpc('delete_user') with a Postgres function
    // 3. Sign out and redirect to home
    toast.error("Exclusão de conta ainda não implementada. Entre em contato com o suporte.");
    setDeleteModalOpen(false);
    setDeleteConfirmText("");
  };

  // ── Section 6: Data export ──────────────────────────────────────────────────
  const handleExportTrips = () => {
    if (trips.length === 0) {
      toast.warning("Nenhuma viagem para exportar.");
      return;
    }
    exportTripsToExcel(trips);
    toast.success(`${trips.length} viagem(ns) exportada(s) para Excel.`);
  };

  const handleExportFleet = () => {
    if (vehicles.length === 0 && tires.length === 0) {
      toast.warning("Nenhum dado de frota para exportar.");
      return;
    }
    exportFleetToExcel(vehicles, tires);
    toast.success(`Frota exportada: ${vehicles.length} veículo(s), ${tires.length} pneu(s).`);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--text-primary)" }}>
          Configurações
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Gerencie seu perfil, preferências e dados do sistema.
        </p>
      </div>

      <div className="space-y-6">

        {/* ── 1. Perfil ──────────────────────────────────────────────────────── */}
        <SectionCard
          icon={User}
          title="Perfil"
          description="Suas informações pessoais e de conta"
        >
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {/* Clickable avatar with camera overlay */}
              <button
                type="button"
                aria-label="Alterar foto de perfil"
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-green-500/20 focus:outline-none focus-visible:ring-[#16a34a]"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-2xl font-bold text-white">
                    {getUserInitials()}
                  </div>
                )}

                {/* Camera overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>

                {/* Spinner overlay while uploading (always visible) */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarUpload(e)}
              />

              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {user?.fullName || "Usuário"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
              <Input
                label="Email"
                value={user?.email ?? ""}
                disabled
                placeholder="seu@email.com"
              />
              <Input
                label="Empresa / Frota"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nome da empresa ou frota"
              />
              <Input
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                type="tel"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleSaveProfile()}
                disabled={profileSaving}
              >
                {profileSaving ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Preferências do sistema ─────────────────────────────────────── */}
        <SectionCard
          icon={SlidersHorizontal}
          title="Preferências do sistema"
          description="Aparência e unidades de medida"
          iconBg="bg-purple-100"
          iconColor="text-purple-700"
        >
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            <ToggleRow
              label="Modo escuro"
              description="Muda a aparência do sistema para tema escuro"
              checked={isDark}
              onChange={handleDarkToggle}
            />
            <div className="py-3 last:pb-0">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Unidade de distância
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => handleUnitChange(e.target.value as "km" | "mi")}
                className={selectCls + " max-w-xs"}
              >
                <option value="km">Quilômetros (km)</option>
                <option value="mi">Milhas (mi)</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Notificações ────────────────────────────────────────────────── */}
        <SectionCard
          icon={Bell}
          title="Notificações"
          description="Escolha quais alertas deseja receber"
          iconBg="bg-amber-100"
          iconColor="text-amber-700"
        >
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            <ToggleRow
              label="Alertas de pneu crítico"
              description="Notifica quando um pneu atingir saúde abaixo de 20%"
              checked={notif.criticalTire}
              onChange={(v) => handleNotifChange("criticalTire", v)}
            />
            <ToggleRow
              label="Alertas de manutenção preventiva"
              description="Lembretes de revisão baseados em km rodados"
              checked={notif.maintenance}
              onChange={(v) => handleNotifChange("maintenance", v)}
            />
            <ToggleRow
              label="Resumo semanal por email"
              description="Receba um relatório consolidado toda segunda-feira"
              checked={notif.weeklySummary}
              onChange={(v) => handleNotifChange("weeklySummary", v)}
            />
          </div>
        </SectionCard>

        {/* ── 4. Padrões da frota ────────────────────────────────────────────── */}
        <SectionCard
          icon={SlidersHorizontal}
          title="Padrões da frota"
          description="Valores padrão aplicados ao cadastrar novos itens"
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Linha padrão de pneu
              </label>
              <select
                value={fleetDefaults.defaultTier}
                onChange={(e) =>
                  handleFleetDefaultChange("defaultTier", e.target.value)
                }
                className={selectCls}
              >
                <option value="economico">Econômico</option>
                <option value="intermediario">Intermediário</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Unidade de carga padrão
              </label>
              <select
                value={fleetDefaults.weightUnit}
                onChange={(e) =>
                  handleFleetDefaultChange("weightUnit", e.target.value)
                }
                className={selectCls}
              >
                <option value="t">Toneladas (t)</option>
                <option value="kg">Quilogramas (kg)</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── 5. Conta e segurança ───────────────────────────────────────────── */}
        <SectionCard
          icon={Shield}
          title="Conta e segurança"
          description="Gerenciamento de senha e exclusão de conta"
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPasswordModalOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Trocar senha
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
              onClick={() => setDeleteModalOpen(true)}
            >
              Excluir conta
            </Button>
          </div>
        </SectionCard>

        {/* ── 6. Dados ───────────────────────────────────────────────────────── */}
        <SectionCard
          icon={Database}
          title="Dados"
          description="Exporte seus dados em formato CSV"
          iconBg="bg-teal-100"
          iconColor="text-teal-700"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportTrips}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar viagens (.xlsx)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportFleet}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar frota (.xlsx)
            </Button>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            {trips.length} viagem(ns) · {vehicles.length} veículo(s) · {tires.length} pneu(s) disponíveis para exportar
          </p>
        </SectionCard>

        {/* ── 7. Sobre ───────────────────────────────────────────────────────── */}
        <SectionCard
          icon={Info}
          title="Sobre"
          description="Informações do sistema"
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              ECOPNEUS v1.0
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Sistema de gestão de pneus e frota para o mercado brasileiro.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Suporte e contato:{" "}
              <a
                href="mailto:suporte@ecopneus.com.br"
                className="font-medium text-[#16a34a] hover:underline"
              >
                suporte@ecopneus.com.br
              </a>
            </p>
          </div>
        </SectionCard>

      </div>

      {/* ── Modal: Trocar senha ─────────────────────────────────────────────── */}
      <Modal
        open={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setNewPassword("");
          setConfirmPassword("");
        }}
        title="Trocar senha"
        description="Defina uma nova senha para sua conta"
      >
        <form onSubmit={(e) => void handleChangePassword(e)} className="space-y-4">
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">As senhas não coincidem.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPasswordModalOpen(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                passwordSaving ||
                !newPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 6
              }
            >
              {passwordSaving ? "Salvando…" : "Salvar senha"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Excluir conta ────────────────────────────────────────────── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmText("");
        }}
        title="Excluir conta"
        description="Esta ação é permanente e não pode ser desfeita."
      >
        <div className="space-y-4">
          <div
            className="rounded-xl border p-3 text-sm"
            style={{
              backgroundColor: "var(--bg-page)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Todos os seus dados (veículos, pneus, viagens e perfil) serão permanentemente
            excluídos. Digite{" "}
            <span className="font-mono font-bold text-red-500">EXCLUIR</span> para confirmar.
          </div>
          <Input
            label='Digite "EXCLUIR" para confirmar'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="EXCLUIR"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancelar
            </Button>
            <button
              type="button"
              disabled={deleteConfirmText !== "EXCLUIR"}
              onClick={handleDeleteAccount}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Excluir minha conta
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
