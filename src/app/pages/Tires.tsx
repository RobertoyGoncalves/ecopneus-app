import { useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { CircleDot, Pencil, Plus, Trash2 } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import type { FleetTire } from "../contexts/FleetContext";
import { FABRICANTES_PNEU_BR } from "../data/brazilMarcas";

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
};

export function Tires() {
  const { tires, vehicles, addManualTire, removeTire, updateTire, replaceTire, fleetLoading } = useFleet();

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("Todos");
  const [flowMode, setFlowMode] = useState<FlowMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState(emptyForm);

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
    });
    setShowForm(true);
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

  const getHealthColor = (health: number) => {
    if (health >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (health >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getHealthLabel = (health: number) => {
    if (health >= 80) return "Excelente";
    if (health >= 50) return "Atenção";
    return "Crítico";
  };

  const filteredTires =
    filterType === "Todos" ? tires : tires.filter((t) => t.vehicleType === filterType);

  const tireOptionLabel = (t: FleetTire) =>
    `${t.axis} · ${t.brand} ${t.model} · ${t.health}%`;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Pneus</h1>
          <p className="text-sm md:text-base text-gray-600">
            Veículos cadastrados geram pneus automaticamente. Aqui você inclui, troca ou ajusta dados.
          </p>
          {fleetLoading && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Carregando frota da nuvem…
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Filtrar:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-xs md:text-sm"
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
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Adicionar ou trocar pneu</span>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 md:mb-8">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {flowMode === "edit"
                  ? "Editar pneu"
                  : flowMode === "replace"
                    ? "Substituir pneu"
                    : "Novo pneu"}
              </h3>
              <button
                type="button"
                onClick={cancelForm}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {flowMode !== "edit" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Veículo</label>
                      <select
                        value={formData.fleetVehicleId}
                        onChange={(e) => handleVehicleChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                      <label className="block text-sm text-gray-700 mb-2">Operação</label>
                      <select
                        value={flowMode === "replace" ? "replace" : "add"}
                        onChange={(e) => {
                          const m = e.target.value === "replace" ? "replace" : "add";
                          setFlowMode(m);
                          setFormData((f) => ({ ...f, replaceTargetId: "" }));
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        disabled={!formData.fleetVehicleId}
                      >
                        <option value="add">Adicionar pneu ao veículo</option>
                        <option value="replace">Substituir pneu já cadastrado</option>
                      </select>
                    </div>
                  </div>

                  {flowMode === "replace" && formData.fleetVehicleId && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Qual pneu está sendo substituído?
                      </label>
                      <select
                        value={formData.replaceTargetId}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, replaceTargetId: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                        <p className="text-xs text-amber-700 mt-1">
                          Não há pneus listados para este veículo.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Eixo"
                  placeholder="Ex.: Dianteiro"
                  value={formData.axis}
                  onChange={(e) => setFormData({ ...formData, axis: e.target.value })}
                  required
                />
                <Input
                  label="Modelo do pneu"
                  placeholder="Ex.: XZY Premium"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fabricante</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredTires.map((tire) => (
          <Card key={tire.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                  <CircleDot className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs border ${getHealthColor(tire.health)}`}>
                  {getHealthLabel(tire.health)}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{tire.model}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-1">{tire.brand}</p>
              <p className="text-xs text-gray-500 mb-4">
                {tire.vehicleType} · {tire.vehicle || "Sem veículo"}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Eixo</span>
                  <span className="text-xs md:text-sm font-medium text-gray-900">{tire.axis}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-gray-600">Vida útil</span>
                    <span className="text-xs md:text-sm font-medium text-gray-900">{tire.health}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        tire.health >= 80 ? "bg-green-500"
                        : tire.health >= 50 ? "bg-yellow-500"
                        : "bg-red-500"
                      }`}
                      style={{ width: `${tire.health}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-sm"
                  onClick={() => openEditForm(tire)}
                >
                  <Pencil className="w-4 h-4 mr-1 inline" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => handleRemove(tire)}
                >
                  <Trash2 className="w-4 h-4 mr-1 inline" />
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
