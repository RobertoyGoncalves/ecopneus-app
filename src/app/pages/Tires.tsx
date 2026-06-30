import React, { useMemo, useState } from "react";
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
import type { FleetTire } from "../contexts/FleetContext";
import { FABRICANTES_PNEU_BR } from "../data/brazilMarcas";
import { getModelsForBrand } from "../data/tireSpecsCatalog";
import { getTireLifespanKm } from "../../services/tireSpecsService";

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

export function Tires() {
  const { tires, vehicles, addManualTire, removeTire, updateTire, replaceTire, fleetLoading } = useFleet();

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

  const filteredTires =
    filterType === "Todos" ? tires : tires.filter((t) => t.vehicleType === filterType);

  const selectCls = "h-11 w-full rounded-xl border px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)]";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {fleetLoading && (
          <div
            className="rounded-lg border px-4 py-2.5 text-sm sm:mr-auto"
            style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
          >
            Carregando frota da nuvem…
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs" style={{ color: "var(--text-secondary)" }}>Filtrar:</span>
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

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
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
                      <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Veículo</label>
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
                      <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Operação</label>
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
                      <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>
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
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>
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
                          )}
                        inputValue={formData.model}
                        onInputChange={(_, val) =>
                          setFormData((f) => ({ ...f, model: val ?? "" }))}
                        value={formData.model === "" ? null : formData.model}
                        onChange={(_, v) =>
                          setFormData((f) => ({
                            ...f,
                            model: typeof v === "string" ? v : v ?? "",
                          }))}
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
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Fabricante</label>
                  <Autocomplete<string, false, false, true>
                    freeSolo
                    disablePortal
                    sx={muiRounded}
                    options={FABRICANTES_PNEU_BR.slice()}
                    filterOptions={(options, params) =>
                      options.filter((o) =>
                        o.toLowerCase().includes(params.inputValue.toLowerCase()))}
                    inputValue={formData.brand}
                    onInputChange={(_, val) =>
                      setFormData((f) => ({ ...f, brand: val ?? "" }))}
                    value={formData.brand === "" ? null : formData.brand}
                    onChange={(_, v) =>
                      setFormData((f) => ({
                        ...f,
                        brand: typeof v === "string" ? v : v ?? "",
                      }))}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Digite ou selecione" size="small" required />
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
                  onChange={(e) => setFormData({ ...formData, estimatedLifeKm: e.target.value })}
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

      {/* Tire cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
        {filteredTires.map((tire) => (
          <Card key={tire.id} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-5">
              {/* Header: icon + status badge */}
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
              <h3 className="mb-0.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{tire.model}</h3>
              <p className="mb-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{tire.brand}</p>
              <p className="mb-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                {tire.vehicleType} · {tire.vehicle || "Sem veículo"}
              </p>

              {/* Axis */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Eixo</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{tire.axis}</span>
              </div>

              {/* Wear bar */}
              <div className="mb-4">
                <WearBar wear={tire.health} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-3" style={{ borderColor: "var(--border-color)" }}>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-xs"
                  onClick={() => openEditForm(tire)}
                >
                  <Pencil className="mr-1 inline h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(tire)}
                >
                  <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
