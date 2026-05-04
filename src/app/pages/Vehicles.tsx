import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Car, Truck, Bike } from "lucide-react";
import { useFleet } from "../contexts/FleetContext";
import { FABRICANTES_PNEU_BR, MARCAS_VEICULO_BR } from "../data/brazilMarcas";
import type { TireQualityTier } from "../domain/wearModel";

const muiRounded = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
} as const;

export function Vehicles() {
  const { vehicles, addVehicle, removeVehicle, fleetLoading } = useFleet();

  const [filterType, setFilterType] = useState("Todos");

  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    year: "",
    plate: "",
    tireCount: "",
    tireManufacturer: "",
    tireModel: "",
    tireQualityTier: "intermediario" as TireQualityTier,
  });

  const handleTypeChange = (type: string) => {
    if (type === "Carro") {
      setFormData((f) => ({ ...f, type, tireCount: "4" }));
      return;
    }
    if (type === "Moto") {
      setFormData((f) => ({ ...f, type, tireCount: "2" }));
      return;
    }
    setFormData((f) => ({ ...f, type, tireCount: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTireCount = Number(formData.tireCount);
    const tireCount = formData.type === "Caminhão"
      ? Math.min(24, Math.max(4, Math.round(Number.isFinite(parsedTireCount) ? parsedTireCount : 6)))
      : formData.type === "Carro"
        ? 4
        : 2;

    await addVehicle({
      type: formData.type,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: formData.year,
      plate: formData.plate.trim().toUpperCase(),
      tireCount,
      tireManufacturer: formData.tireManufacturer.trim(),
      tireModel: formData.tireModel.trim(),
      tireQualityTier: formData.tireQualityTier,
    });
    setFormData({
      type: "",
      brand: "",
      model: "",
      year: "",
      plate: "",
      tireCount: "",
      tireManufacturer: "",
      tireModel: "",
      tireQualityTier: "intermediario",
    });
  };

  const filteredVehicles = filterType === "Todos"
    ? vehicles
    : vehicles.filter((v) => v.type === filterType);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "Caminhão":
        return <Truck className="w-5 h-5" />;
      case "Carro":
        return <Car className="w-5 h-5" />;
      case "Moto":
        return <Bike className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getVehicleBadgeColor = (type: string) => {
    switch (type) {
      case "Caminhão":
        return "bg-blue-100 text-blue-700";
      case "Carro":
        return "bg-purple-100 text-purple-700";
      case "Moto":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Veículos</h1>
        <p className="text-sm md:text-base text-gray-600">Gerencie todos os seus veículos em um só lugar</p>
      </div>

      {fleetLoading && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Carregando frota da nuvem…
        </div>
      )}

      {/* Add Vehicle Form */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Cadastrar Novo Veículo</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Pneus com mesmo modelo/fabricante são gerados para a página Pneus
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo de Veículo</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
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
                <label className="block text-sm text-gray-700 mb-2">Marca do veículo</label>
                <Autocomplete<string, false, false, true>
                  freeSolo
                  disablePortal
                  options={MARCAS_VEICULO_BR.slice()}
                  sx={muiRounded}
                  filterOptions={(options, params) =>
                    options.filter((o) =>
                      o.toLowerCase().includes(params.inputValue.toLowerCase()))
                  }
                  value={formData.brand === "" ? null : formData.brand}
                  onChange={(_, v) =>
                    setFormData((f) => ({ ...f, brand: typeof v === "string" ? v : v ?? "" }))}
                  inputValue={formData.brand}
                  onInputChange={(_, val) =>
                    setFormData((f) => ({ ...f, brand: val ?? "" }))}
                  renderInput={(params) => (
                    <TextField {...params} required placeholder="Digite ou escolha" size="small" />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">Lista de marcas populares no Brasil</p>
              </div>
              <Input
                label="Modelo"
                placeholder="Ex: FH 540, Corolla, CG 160"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ano"
                placeholder="2023"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
              <Input
                label="Placa"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Fabricante do pneu</label>
                <Autocomplete<string, false, false, true>
                  freeSolo
                  disablePortal
                  sx={muiRounded}
                  options={FABRICANTES_PNEU_BR.slice()}
                  filterOptions={(options, params) =>
                    options.filter((o) =>
                      o.toLowerCase().includes(params.inputValue.toLowerCase()))}
                  value={formData.tireManufacturer === "" ? null : formData.tireManufacturer}
                  inputValue={formData.tireManufacturer}
                  onInputChange={(_, val) =>
                    setFormData((f) => ({ ...f, tireManufacturer: val ?? "" }))}
                  onChange={(_, v) =>
                    setFormData((f) => ({
                      ...f,
                      tireManufacturer: typeof v === "string" ? v : v ?? "",
                    }))}
                  renderInput={(params) => (
                    <TextField {...params} required placeholder="Ex: Michelin" size="small" />
                  )}
                />
              </div>
              <Input
                label="Modelo do pneu"
                placeholder="Ex: XZY Premium, Cinturato"
                value={formData.tireModel}
                onChange={(e) => setFormData({ ...formData, tireModel: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Linha dos pneus (modelo empírico)
                </label>
                <select
                  value={formData.tireQualityTier}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      tireQualityTier: e.target.value as TireQualityTier,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="economico">Econômico — desgaste relativo maior</option>
                  <option value="intermediario">Intermediário — referência</option>
                  <option value="premium">Premium — desgaste relativo menor</option>
                </select>
              </div>
            </div>

            {formData.type === "Caminhão" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantidade de pneus"
                  placeholder="Ex: 10"
                  type="number"
                  min="4"
                  max="24"
                  value={formData.tireCount}
                  onChange={(e) => setFormData({ ...formData, tireCount: e.target.value })}
                  required
                />
              </div>
            ) : formData.type ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  Quantidade de pneus:{" "}
                  <span className="font-semibold text-gray-900">{formData.tireCount}</span>
                  {" "}(uso automático conforme tipo)
                </p>
              </div>
            ) : null}

            <Button type="submit" variant="primary">
              Cadastrar veículo e pneus
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Veículos cadastrados</h3>
              <p className="text-xs md:text-sm text-gray-600">{filteredVehicles.length} veículo(s) encontrado(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-600">Filtrar:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-xs md:text-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Tipo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Marca</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Modelo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Ano</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Placa</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Pneus</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Pneu (fab./modelo / linha)
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-medium ${getVehicleBadgeColor(
                          vehicle.type
                        )}`}
                      >
                        {getVehicleIcon(vehicle.type)}
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-900 font-medium">{vehicle.brand}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{vehicle.model}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{vehicle.year}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="font-mono text-gray-900 bg-gray-100 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{vehicle.tireCount}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">
                      {vehicle.tireManufacturer} {vehicle.tireModel}
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Linha:{" "}
                        {vehicle.tireQualityTier === "economico"
                          ? "Econômico"
                          : vehicle.tireQualityTier === "premium"
                            ? "Premium"
                            : "Intermediário"}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <Button variant="ghost" type="button" onClick={() => void removeVehicle(vehicle.id)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 p-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getVehicleBadgeColor(
                          vehicle.type
                        )}`}
                      >
                        {getVehicleIcon(vehicle.type)}
                        {vehicle.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Pneus: {vehicle.tireManufacturer} {vehicle.tireModel} • Linha{" "}
                      {vehicle.tireQualityTier === "economico"
                        ? "Econômico"
                        : vehicle.tireQualityTier === "premium"
                          ? "Premium"
                          : "Intermediário"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Ano</p>
                    <p className="text-sm font-medium text-gray-900">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Placa</p>
                    <p className="text-sm font-mono font-medium text-gray-900">{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quantidade pneus</p>
                    <p className="text-sm font-medium text-gray-900">{vehicle.tireCount}</p>
                  </div>
                </div>
                <Button variant="ghost" type="button" onClick={() => void removeVehicle(vehicle.id)} className="w-full text-sm">
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
