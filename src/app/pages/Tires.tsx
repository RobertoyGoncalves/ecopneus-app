import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { CircleDot, Plus } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import { FABRICANTES_PNEU_BR } from "../data/brazilMarcas";

const muiRounded = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
} as const;

export function Tires() {
  const { tires, vehicles, addManualTire } = useFleet();

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("Todos");

  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    axis: "",
    health: "",
    vehicleType: "",
    fleetVehicleId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hv = vehicles.find((v) => String(v.id) === formData.fleetVehicleId);

    addManualTire({
      model: formData.model.trim(),
      brand: formData.brand.trim(),
      axis: formData.axis.trim(),
      health: Math.min(100, Math.max(0, Number(formData.health) || 0)),
      vehicleType: formData.vehicleType,
      vehicle: hv ? formatVehicleLabel(hv) : "",
      vehicleId: hv ? hv.id : null,
    });

    setFormData({ model: "", brand: "", axis: "", health: "", vehicleType: "", fleetVehicleId: "" });
    setShowForm(false);
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

  const handleVehiclePick = (idStr: string) => {
    if (!idStr) {
      setFormData((f) => ({ ...f, fleetVehicleId: "", vehicleType: "" }));
      return;
    }
    const v = vehicles.find((x) => String(x.id) === idStr);
    if (!v) return;
    setFormData((f) => ({
      ...f,
      fleetVehicleId: idStr,
      vehicleType: v.type,
      brand: f.brand || v.tireManufacturer,
      model: f.model || v.tireModel,
    }));
  };

  const vehiclesFilteredByType =
    formData.vehicleType === ""
      ? vehicles
      : vehicles.filter((v) => v.type === formData.vehicleType);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Pneus</h1>
          <p className="text-sm md:text-base text-gray-600">
            Cadastros automáticos vêm dos veículos; aqui você adiciona exceções manualmente.
          </p>
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Novo pneu manual</span>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 md:mb-8">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tipo de veículo</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        vehicleType: e.target.value,
                        fleetVehicleId: "",
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Veículo vinculado (cadastro)
                  </label>
                  <select
                    value={formData.fleetVehicleId}
                    disabled={!formData.vehicleType || vehiclesFilteredByType.length === 0}
                    onChange={(e) => handleVehiclePick(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    required
                  >
                    <option value="">
                      {vehiclesFilteredByType.length === 0 ? "Cadastre veículos desse tipo" : "Escolha o veículo"}
                    </option>
                    {vehiclesFilteredByType.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {formatVehicleLabel(v)}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Eixo"
                  placeholder="Dianteiro ou Traseiro"
                  value={formData.axis}
                  onChange={(e) => setFormData({ ...formData, axis: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Modelo do pneu"
                  placeholder="Ex: XZY Premium"
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
                <Input
                  label="Vida útil (%)"
                  placeholder="0-100"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.health}
                  onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary">
                  Adicionar pneu
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
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
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <CircleDot className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs border ${getHealthColor(tire.health)}`}>
                  {getHealthLabel(tire.health)}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{tire.model}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-1">{tire.brand}</p>
              <p className="text-xs text-gray-500 mb-3">
                {tire.vehicleType} • {tire.vehicle || "Sem veículo"}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Eixo:</span>
                  <span className="text-xs md:text-sm font-medium text-gray-900">{tire.axis}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-gray-600">Vida útil:</span>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
