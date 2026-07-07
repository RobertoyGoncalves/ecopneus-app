import React, { useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { WearBar } from "../components/ui/WearBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TireIcon } from "../components/ui/TireIcon";
import { toast } from "sonner";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import type { FleetTire, FleetVehicle } from "../contexts/FleetContext";
import { useAuth } from "../contexts/AuthContext";
import { FABRICANTES_PNEU_BR } from "../data/brazilMarcas";
import { getModelsForBrand } from "../data/tireSpecsCatalog";
import { getTireLifespanKm } from "../../services/tireSpecsService";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";
import {
  DriverSummaryModal,
  type OperatorProfile,
} from "../components/ui/DriverSummaryModal";

// ─── constants ────────────────────────────────────────────────────────────────

const muiRounded = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
} as const;

type FlowMode = "add" | "replace" | "edit";

const emptyForm = {
  fleetVehicleId: "",
  replaceTargetId: "",
  model: "",
  brand: "",
  axis: "",
  health: "",
  estimatedLifeKm: "",
};

function getHealthStatus(health: number): string {
  if (health >= 80) return "Excelente";
  if (health >= 50) return "Atenção";
  return "Crítico";
}

// ─── OperatorAvatarStack ──────────────────────────────────────────────────────

interface VehicleOpData {
  /** Distinct operator IDs, ordered by most-recent trip first. */
  operatorIds: string[];
  /** Operator of the most recent trip for this vehicle. */
  lastOperatorId: string | null;
}

function OperatorAvatarStack({
  data,
  profiles,
  onOpen,
}: {
  data: VehicleOpData;
  profiles: Record<string, OperatorProfile>;
  onOpen: (id: string) => void;
}) {
  const maxVisible = 3;
  const visible = data.operatorIds.slice(0, maxVisible);
  const overflow = data.operatorIds.length - maxVisible;
  const lastProfile = data.lastOperatorId ? profiles[data.lastOperatorId] : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex -space-x-2">
        {visible.map((id) => {
          const p = profiles[id];
          const initials = p?.fullName
            ? p.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
            : "?";
          return (
            <button
              key={id}
              type="button"
              title={p?.fullName ?? "Operador"}
              onClick={() => onOpen(id)}
              className="relative h-8 w-8 rounded-full border-2 border-[var(--bg-page)] transition-opacity hover:z-10 hover:opacity-70"
            >
              {p?.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-[9px] font-bold text-white">
                  {initials}
                </div>
              )}
            </button>
          );
        })}
        {overflow > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-page)] bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            +{overflow}
          </div>
        )}
      </div>
      {lastProfile && (
        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
          Última viagem:{" "}
          <span className="font-medium">
            {lastProfile.fullName?.split(" ")[0] ?? "?"}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── TireCard ─────────────────────────────────────────────────────────────────

function TireCard({
  tire,
  onEdit,
  onRemove,
}: {
  tire: FleetTire;
  onEdit: (t: FleetTire) => void;
  onRemove: (t: FleetTire) => void;
}) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        {/* Header: icon + status */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <TireIcon
            size={40}
            className={
              tire.health >= 60
                ? "text-gray-400"
                : tire.health >= 20
                  ? "text-yellow-500"
                  : "text-red-500"
            }
          />
          <StatusBadge status={getHealthStatus(tire.health)} />
        </div>

        {/* Title */}
        <h3
          className="mb-0.5 text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {tire.model}
        </h3>
        <p className="mb-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          {tire.brand}
        </p>

        {/* Axis */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Eixo
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {tire.axis}
          </span>
        </div>

        {/* Wear bar */}
        <div className="mb-4">
          <WearBar wear={tire.health} />
        </div>

        {/* Actions */}
        <div
          className="flex gap-2 border-t pt-3"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-xs"
            onClick={() => onEdit(tire)}
          >
            <Pencil className="mr-1 inline h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-xs text-red-600 hover:bg-red-50"
            onClick={() => onRemove(tire)}
          >
            <Trash2 className="mr-1 inline h-3.5 w-3.5" />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── VehicleGroupCard ─────────────────────────────────────────────────────────

function VehicleGroupCard({
  vehicle,
  tires,
  opData,
  operatorProfiles,
  onEditTire,
  onRemoveTire,
  onOpenDriver,
}: {
  vehicle: FleetVehicle;
  tires: FleetTire[];
  opData: VehicleOpData | undefined;
  operatorProfiles: Record<string, OperatorProfile>;
  onEditTire: (t: FleetTire) => void;
  onRemoveTire: (t: FleetTire) => void;
  onOpenDriver: (id: string) => void;
}) {
  const worstHealth = tires.length
    ? Math.min(...tires.map((t) => t.health))
    : 100;

  const worstColor =
    worstHealth >= 80
      ? "text-green-600 dark:text-green-400"
      : worstHealth >= 50
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Vehicle header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-page)",
        }}
      >
        {/* Left: vehicle info */}
        <div className="min-w-0">
          <p
            className="truncate font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {formatVehicleLabel(vehicle)}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {vehicle.type} · {tires.length} pneu{tires.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Right: operators + worst health */}
        <div className="flex items-center gap-5">
          {opData && opData.operatorIds.length > 0 && (
            <OperatorAvatarStack
              data={opData}
              profiles={operatorProfiles}
              onOpen={onOpenDriver}
            />
          )}

          <div className="text-right">
            <p className={`text-xl font-bold tabular-nums ${worstColor}`}>
              {worstHealth.toFixed(0)}%
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
              pior pneu
            </p>
            <div className="mt-1 w-20">
              <WearBar wear={worstHealth} />
            </div>
          </div>
        </div>
      </div>

      {/* Tire grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
        {tires.map((tire) => (
          <TireCard
            key={tire.id}
            tire={tire}
            onEdit={onEditTire}
            onRemove={onRemoveTire}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Tires() {
  const { tires, vehicles, addManualTire, removeTire, updateTire, replaceTire, fleetLoading } = useFleet();
  const { supabaseUserId, papel, empresaId } = useAuth();
  const donoId = papel === "funcionario" && empresaId ? empresaId : supabaseUserId;

  // ── Form state (unchanged) ─────────────────────────────────────────────────

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("Todos");
  const [flowMode, setFlowMode] = useState<FlowMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const modelOptions = useMemo(
    () => getModelsForBrand(formData.brand),
    [formData.brand]
  );

  const sortedVehicles = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        formatVehicleLabel(a).localeCompare(formatVehicleLabel(b), "pt-BR")
      ),
    [vehicles]
  );

  const tiresForSelectedVehicle = useMemo(() => {
    if (!formData.fleetVehicleId) return [];
    return tires.filter((t) => t.vehicleId === formData.fleetVehicleId);
  }, [tires, formData.fleetVehicleId]);

  const selectedVehicle = vehicles.find((v) => String(v.id) === formData.fleetVehicleId);

  // ── Operator data state ────────────────────────────────────────────────────

  const [vehicleOpData, setVehicleOpData] = useState<Record<string, VehicleOpData>>({});
  const [operatorProfiles, setOperatorProfiles] = useState<Record<string, OperatorProfile>>({});
  const [driverModalId, setDriverModalId] = useState<string | null>(null);

  // ── Filtered / grouped data ────────────────────────────────────────────────

  const filteredTires = useMemo(
    () => (filterType === "Todos" ? tires : tires.filter((t) => t.vehicleType === filterType)),
    [tires, filterType]
  );

  /** Vehicles that have at least one tire in the current filter, sorted by label. */
  const filteredVehicles = useMemo(() => {
    const ids = new Set(filteredTires.map((t) => t.vehicleId));
    return [...vehicles]
      .filter((v) => ids.has(v.id))
      .sort((a, b) => formatVehicleLabel(a).localeCompare(formatVehicleLabel(b), "pt-BR"));
  }, [vehicles, filteredTires]);

  // ── Fetch trip operators for all visible vehicles (single query) ───────────

  const vehicleIdKey = filteredVehicles.map((v) => v.id).join(",");

  useEffect(() => {
    if (!filteredVehicles.length || !isSupabaseConfigured() || !donoId) return;

    const vehicleIds = filteredVehicles.map((v) => v.id);

    void (async () => {
      const supabase = getSupabase();

      // Single query: latest 500 trips for all vehicles, ordered by date desc
      const { data: tripRows } = await supabase
        .from("trips")
        .select("vehicle_id, operador_id, created_at")
        .in("vehicle_id", vehicleIds)
        .eq("dono_id", donoId)
        .order("created_at", { ascending: false })
        .limit(500);

      // Group by vehicle_id; order is already newest-first so first seen = most recent
      const byVehicle: Record<string, VehicleOpData> = {};
      for (const row of tripRows ?? []) {
        const r = row as { vehicle_id: string | null; operador_id: string | null };
        if (!r.vehicle_id || !r.operador_id) continue;
        if (!byVehicle[r.vehicle_id]) {
          byVehicle[r.vehicle_id] = {
            operatorIds: [],
            lastOperatorId: r.operador_id,
          };
        }
        if (!byVehicle[r.vehicle_id].operatorIds.includes(r.operador_id)) {
          byVehicle[r.vehicle_id].operatorIds.push(r.operador_id);
        }
      }
      setVehicleOpData(byVehicle);

      // Collect all distinct operator IDs → one profiles query
      const allOpIds = [
        ...new Set(Object.values(byVehicle).flatMap((d) => d.operatorIds)),
      ];
      if (!allOpIds.length) return;

      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", allOpIds);

      const profileMap: Record<string, OperatorProfile> = {};
      for (const row of profileRows ?? []) {
        const r = row as { id: string; full_name: string | null; avatar_url: string | null };
        profileMap[r.id] = { fullName: r.full_name, avatarUrl: r.avatar_url };
      }
      setOperatorProfiles((prev) => ({ ...prev, ...profileMap }));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleIdKey, donoId]);

  // ── Form handlers (unchanged) ──────────────────────────────────────────────

  const openAddForm = () => {
    setEditingId(null);
    setFlowMode("add");
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (tire: FleetTire) => {
    setEditingId(tire.id);
    setFlowMode("edit");
    setFormData({
      fleetVehicleId: String(tire.vehicleId),
      replaceTargetId: "",
      model: tire.model,
      brand: tire.brand,
      axis: tire.axis,
      health: String(tire.health),
      estimatedLifeKm: "",
    });
    setShowForm(true);
  };

  const handleFetchSpecs = async () => {
    const model = formData.model.trim();
    if (!model) return;

    const tier = selectedVehicle?.tireQualityTier ?? "intermediario";
    try {
      const { km_estimado, fonte, origem } = await getTireLifespanKm(model, {
        brand: formData.brand.trim(),
        tier,
      });
      if (km_estimado != null) {
        setFormData((f) => ({ ...f, estimatedLifeKm: String(km_estimado) }));
        const detail = fonte
          ? `${km_estimado.toLocaleString("pt-BR")} km (${fonte})`
          : `${km_estimado.toLocaleString("pt-BR")} km`;
        if (origem === "catalogo") {
          toast.success(`Catálogo: ${detail}`);
        } else {
          toast.success(`Estimativa: ${detail}`);
        }
      } else {
        toast.warning("Informe o modelo do pneu para consultar a vida útil.");
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Não foi possível consultar as especificações. Preencha manualmente.";
      toast.error(msg);
    }
  };

  const handleVehicleChange = (idStr: string) => {
    const v = vehicles.find((x) => String(x.id) === idStr);
    setFormData((f) => ({
      ...f,
      fleetVehicleId: idStr,
      replaceTargetId: "",
      brand: v && flowMode !== "edit" ? v.tireManufacturer : f.brand,
      model: v && flowMode !== "edit" ? v.tireModel : f.model,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hv = vehicles.find((v) => String(v.id) === formData.fleetVehicleId);
    if (!hv && flowMode !== "edit") return;

    const healthNum = Math.min(100, Math.max(0, Number(formData.health) || 0));

    if (flowMode === "edit" && editingId !== null) {
      await updateTire(editingId, {
        model: formData.model.trim(),
        brand: formData.brand.trim(),
        axis: formData.axis.trim(),
        health: healthNum,
      });
      setShowForm(false);
      setFormData(emptyForm);
      setEditingId(null);
      return;
    }

    if (!hv) return;

    if (flowMode === "replace" && formData.replaceTargetId) {
      const oldId = formData.replaceTargetId;
      await replaceTire(oldId, {
        model: formData.model.trim(),
        brand: formData.brand.trim(),
        axis: formData.axis.trim(),
        health: healthNum,
        vehicleType: hv.type,
        vehicleId: hv.id,
      });
    } else {
      await addManualTire({
        model: formData.model.trim(),
        brand: formData.brand.trim(),
        axis: formData.axis.trim(),
        health: healthNum,
        vehicleType: hv.type,
        vehicle: formatVehicleLabel(hv),
        vehicleId: hv.id,
      });
    }

    setFormData(emptyForm);
    setFlowMode("add");
    setShowForm(false);
  };

  const handleRemove = (tire: FleetTire) => {
    if (
      !window.confirm(
        `Remover este pneu (${tire.brand} ${tire.model}, ${tire.axis}) do cadastro?`
      )
    ) {
      return;
    }
    void removeTire(tire.id);
  };

  const cancelForm = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
    setFlowMode("add");
  };

  const tireOptionLabel = (t: FleetTire) =>
    `${t.axis} · ${t.brand} ${t.model} · ${t.health}%`;

  const selectCls = "h-11 w-full rounded-xl border px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)]";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {fleetLoading && (
          <div
            className="rounded-lg border px-4 py-2.5 text-sm sm:mr-auto"
            style={{
              backgroundColor: "var(--bg-page)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Carregando frota da nuvem…
          </div>
        )}
        <div className="flex items-center gap-2">
          <span
            className="whitespace-nowrap text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Filtrar:
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-xl border px-3 text-xs transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 sm:flex-none md:px-4 md:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)]"
          >
            <option value="Todos">Todos</option>
            <option value="Caminhão">Caminhão</option>
            <option value="Carro">Carro</option>
            <option value="Moto">Moto</option>
          </select>
        </div>
        <Button
          variant="primary"
          onClick={() => openAddForm()}
          className="flex items-center justify-center gap-2 sm:ml-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Adicionar ou trocar pneu</span>
        </Button>
      </div>

      {/* Add / edit form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {flowMode === "edit"
                  ? "Editar pneu"
                  : flowMode === "replace"
                    ? "Substituir pneu"
                    : "Novo pneu"}
              </h3>
              <button
                type="button"
                onClick={cancelForm}
                className="text-sm hover:underline"
                style={{ color: "var(--text-secondary)" }}
              >
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {flowMode !== "edit" && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Veículo
                      </label>
                      <select
                        value={formData.fleetVehicleId}
                        onChange={(e) => handleVehicleChange(e.target.value)}
                        className={selectCls}
                        required
                      >
                        <option value="">Escolha marca, modelo e placa</option>
                        {sortedVehicles.map((v) => (
                          <option key={v.id} value={String(v.id)}>
                            {formatVehicleLabel(v)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Operação
                      </label>
                      <select
                        value={flowMode === "replace" ? "replace" : "add"}
                        onChange={(e) => {
                          const m = e.target.value === "replace" ? "replace" : "add";
                          setFlowMode(m);
                          setFormData((f) => ({ ...f, replaceTargetId: "" }));
                        }}
                        className={selectCls}
                        disabled={!formData.fleetVehicleId}
                      >
                        <option value="add">Adicionar pneu ao veículo</option>
                        <option value="replace">Substituir pneu já cadastrado</option>
                      </select>
                    </div>
                  </div>

                  {flowMode === "replace" && formData.fleetVehicleId && (
                    <div>
                      <label
                        className="mb-2 block text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Qual pneu está sendo substituído?
                      </label>
                      <select
                        value={formData.replaceTargetId}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, replaceTargetId: e.target.value }))
                        }
                        className={selectCls}
                        required={flowMode === "replace"}
                      >
                        <option value="">Selecione o pneu atual</option>
                        {tiresForSelectedVehicle.map((t) => (
                          <option key={t.id} value={String(t.id)}>
                            {tireOptionLabel(t)}
                          </option>
                        ))}
                      </select>
                      {tiresForSelectedVehicle.length === 0 && (
                        <p className="mt-1 text-xs text-amber-700">
                          Não há pneus listados para este veículo.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Eixo"
                  placeholder="Ex.: Dianteiro"
                  value={formData.axis}
                  onChange={(e) => setFormData({ ...formData, axis: e.target.value })}
                  required
                />
                <div>
                  <label
                    className="mb-2 block text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Modelo do pneu <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <Autocomplete<string, false, false, true>
                        freeSolo
                        disablePortal
                        sx={muiRounded}
                        options={modelOptions}
                        filterOptions={(options, params) =>
                          options.filter((o) =>
                            o.toLowerCase().includes(params.inputValue.toLowerCase())
                          )
                        }
                        inputValue={formData.model}
                        onInputChange={(_, val) =>
                          setFormData((f) => ({ ...f, model: val ?? "" }))
                        }
                        value={formData.model === "" ? null : formData.model}
                        onChange={(_, v) =>
                          setFormData((f) => ({
                            ...f,
                            model: typeof v === "string" ? v : v ?? "",
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Ex.: X Multi Z"
                            size="small"
                            required
                          />
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0 whitespace-nowrap text-sm sm:self-start"
                      disabled={!formData.model.trim()}
                      onClick={() => void handleFetchSpecs()}
                    >
                      Buscar specs
                    </Button>
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Fabricante
                  </label>
                  <Autocomplete<string, false, false, true>
                    freeSolo
                    disablePortal
                    sx={muiRounded}
                    options={FABRICANTES_PNEU_BR.slice()}
                    filterOptions={(options, params) =>
                      options.filter((o) =>
                        o.toLowerCase().includes(params.inputValue.toLowerCase())
                      )
                    }
                    inputValue={formData.brand}
                    onInputChange={(_, val) =>
                      setFormData((f) => ({ ...f, brand: val ?? "" }))
                    }
                    value={formData.brand === "" ? null : formData.brand}
                    onChange={(_, v) =>
                      setFormData((f) => ({
                        ...f,
                        brand: typeof v === "string" ? v : v ?? "",
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Digite ou selecione"
                        size="small"
                        required
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <Input
                  label="Vida útil estimada (km)"
                  placeholder="Ex.: 60000"
                  type="number"
                  min="0"
                  value={formData.estimatedLifeKm}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedLifeKm: e.target.value })
                  }
                />
              </div>
              <Input
                label="Vida útil (%)"
                placeholder="0–100"
                type="number"
                min="0"
                max="100"
                value={formData.health}
                onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                required
              />

              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="primary">
                  {flowMode === "edit"
                    ? "Salvar alterações"
                    : flowMode === "replace"
                      ? "Confirmar troca"
                      : "Adicionar pneu"}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vehicle-grouped tire display */}
      {filteredTires.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border py-16 text-center"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <TireIcon size={48} className="text-gray-300 dark:text-gray-600" />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {filterType === "Todos"
              ? "Nenhum pneu cadastrado ainda."
              : `Nenhum pneu para veículos do tipo "${filterType}".`}
          </p>
          <Button variant="primary" onClick={openAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar primeiro pneu
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredVehicles.map((vehicle) => {
            const vehicleTires = filteredTires.filter(
              (t) => t.vehicleId === vehicle.id
            );
            if (!vehicleTires.length) return null;
            return (
              <VehicleGroupCard
                key={vehicle.id}
                vehicle={vehicle}
                tires={vehicleTires}
                opData={vehicleOpData[vehicle.id]}
                operatorProfiles={operatorProfiles}
                onEditTire={openEditForm}
                onRemoveTire={handleRemove}
                onOpenDriver={(id) => setDriverModalId(id)}
              />
            );
          })}
        </div>
      )}

      <DriverSummaryModal
        driverId={driverModalId}
        onClose={() => setDriverModalId(null)}
      />
    </div>
  );
}
