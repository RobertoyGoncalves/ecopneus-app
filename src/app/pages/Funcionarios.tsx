import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { Users, UserX, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/ui/Modal";
import { DriverSummaryModal } from "../components/ui/DriverSummaryModal";
import { useAuth } from "../contexts/AuthContext";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FuncionarioRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/20">
        <Users className="h-8 w-8 text-green-600" />
      </div>
      <h3
        className="mb-1 text-base font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Nenhum funcionário vinculado
      </h3>
      <p className="max-w-xs text-sm" style={{ color: "var(--text-secondary)" }}>
        Gere um código de convite em{" "}
        <a
          href="/app/settings"
          className="font-medium text-[#16a34a] hover:underline"
        >
          Configurações
        </a>{" "}
        e compartilhe com sua equipe.
      </p>
    </div>
  );
}

// ─── Funcionário card ─────────────────────────────────────────────────────────

function FuncionarioCard({
  funcionario,
  tripCount,
  onDesvincular,
  onClick,
}: {
  funcionario: FuncionarioRow;
  tripCount: number;
  onDesvincular: (f: FuncionarioRow) => void;
  onClick: (f: FuncionarioRow) => void;
}) {
  return (
    <Card>
      <CardContent>
        <div
          className="flex cursor-pointer items-start gap-4 transition-opacity hover:opacity-80"
          role="button"
          tabIndex={0}
          onClick={() => onClick(funcionario)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick(funcionario);
          }}
        >
          {/* Avatar */}
          <div className="shrink-0">
            {funcionario.avatar_url ? (
              <img
                src={funcionario.avatar_url}
                alt={funcionario.full_name ?? "Funcionário"}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-green-500/20"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-lg font-bold text-white ring-2 ring-green-500/20">
                {getInitials(funcionario.full_name)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p
              className="truncate font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {funcionario.full_name || "Sem nome"}
            </p>

            {/* Trip count badge */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                <MapPin className="h-3 w-3" />
                {tripCount} viagem{tripCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Desvincular */}
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            onClick={(e) => { e.stopPropagation(); onDesvincular(funcionario); }}
          >
            <UserX className="mr-1.5 h-3.5 w-3.5" />
            Desvincular
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Funcionarios() {
  const { supabaseUserId, papel } = useAuth();

  const [funcionarios, setFuncionarios] = useState<FuncionarioRow[]>([]);
  const [tripCounts, setTripCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Driver summary modal state
  const [driverModalId, setDriverModalId] = useState<string | null>(null);

  // Confirm-modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<FuncionarioRow | null>(null);
  const [desvinculando, setDesvinculando] = useState(false);

  // Guard: page is only for chefe
  if (papel !== "chefe") {
    return <Navigate to="/app" replace />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fetchFuncionarios = useCallback(async () => {
    if (!supabaseUserId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("empresa_id", supabaseUserId);

      if (error) throw error;

      const rows = (data ?? []) as FuncionarioRow[];
      setFuncionarios(rows);

      // Count trips operated by each employee within this company
      const counts: Record<string, number> = {};
      await Promise.all(
        rows.map(async (f) => {
          const { count } = await supabase
            .from("trips")
            .select("id", { count: "exact", head: true })
            .eq("operador_id", f.id)
            .eq("dono_id", supabaseUserId);
          counts[f.id] = count ?? 0;
        })
      );
      setTripCounts(counts);
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
      toast.error("Não foi possível carregar os funcionários.");
    } finally {
      setLoading(false);
    }
  }, [supabaseUserId]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    void fetchFuncionarios();
  }, [fetchFuncionarios]);

  const openConfirm = (f: FuncionarioRow) => {
    setConfirmTarget(f);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const handleDesvincular = async () => {
    if (!confirmTarget || !isSupabaseConfigured()) return;

    setDesvinculando(true);
    try {
      const { data, error } = await getSupabase().rpc("desvincular_funcionario", {
        p_funcionario_id: confirmTarget.id,
      });

      if (error) throw error;

      const res = data as { ok: boolean; erro?: string };
      if (!res.ok) {
        toast.error(res.erro ?? "Erro ao desvincular funcionário.");
        return;
      }

      toast.success(`${confirmTarget.full_name ?? "Funcionário"} foi desvinculado com sucesso.`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== confirmTarget.id));
      setTripCounts((prev) => {
        const next = { ...prev };
        delete next[confirmTarget.id];
        return next;
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao desvincular. Tente novamente.");
    } finally {
      setDesvinculando(false);
      closeConfirm();
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h2
          className="text-xl font-bold md:text-2xl"
          style={{ color: "var(--text-primary)" }}
        >
          Funcionários
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Gerencie os colaboradores vinculados à sua empresa.
        </p>
      </div>

      {/* Summary bar */}
      {!loading && funcionarios.length > 0 && (
        <div className="mb-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Users className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {funcionarios.length} funcionário{funcionarios.length !== 1 ? "s" : ""} vinculado{funcionarios.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Total de{" "}
                    {Object.values(tripCounts).reduce((a, b) => a + b, 0)} viagem(ns) registradas pela equipe
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando funcionários…
        </div>
      ) : funcionarios.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {funcionarios.map((f) => (
            <FuncionarioCard
              key={f.id}
              funcionario={f}
              tripCount={tripCounts[f.id] ?? 0}
              onDesvincular={openConfirm}
              onClick={(func) => setDriverModalId(func.id)}
            />
          ))}
        </div>
      )}

      {/* Driver summary modal */}
      <DriverSummaryModal
        driverId={driverModalId}
        onClose={() => setDriverModalId(null)}
      />

      {/* Confirm desvincular modal */}
      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        title="Desvincular funcionário"
        description="Esta ação reverterá o vínculo. O usuário voltará a ser autônomo e perderá acesso à frota."
      >
        <div className="space-y-4">
          {confirmTarget && (
            <div
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-page)" }}
            >
              {confirmTarget.avatar_url ? (
                <img
                  src={confirmTarget.avatar_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white">
                  {getInitials(confirmTarget.full_name)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {confirmTarget.full_name || "Sem nome"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {tripCounts[confirmTarget.id] ?? 0} viagem(ns) registrada(s)
                </p>
              </div>
            </div>
          )}

          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Os veículos e viagens registrados permanecerão na sua frota — apenas o acesso do funcionário será removido.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={closeConfirm}
              disabled={desvinculando}
            >
              Cancelar
            </Button>
            <button
              type="button"
              onClick={() => void handleDesvincular()}
              disabled={desvinculando}
              className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {desvinculando ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Desvinculando…</>
              ) : (
                <><UserX className="mr-2 h-4 w-4" />Confirmar desvinculação</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
