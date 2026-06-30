import { useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Car, Truck, Bike } from "lucide-react";
import { useFleet } from "../contexts/FleetContext";
import { MARCAS_VEICULO_BR } from "../data/brazilMarcas";
import {
  getBrandsForVehicleType,
  getModelsGroupedByTier,
  findCatalogEntry,
} from "../data/tireSpecsCatalog";
import { getTireLifespanKm } from "../../services/tireSpecsService";
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
    estimatedLifeKm: "",
  });

  const fabricantesOptions = useMemo(
    () =>
      formData.type
        ? getBrandsForVehicleType(formData.type)
        : [],
    [formData.type]
  );

  const modelosAgrupados = useMemo(
    () =>
      formData.type
        ? getModelsGroupedByTier(formData.type, formData.tireManufacturer)
        : null,
    [formData.type, formData.tireManufacturer]
  );

  const handleFetchSpecs = async () => {
    const model = formData.tireModel.trim();
    if (!model) return;

    try {
      const { km_estimado, fonte, origem, tier } = await getTireLifespanKm(model, {
        brand: formData.tireManufacturer.trim(),
        tier: formData.tireQualityTier,
      });

      if (km_estimado != null) {
        setFormData((f) => ({
          ...f,
          estimatedLifeKm: String(km_estimado),
          ...(origem === "catalogo" && tier ? { tireQualityTier: tier } : {}),
        }));
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

  const handleTypeChange = (type: string) => {
    const reset = { tireManufacturer: "", tireModel: "", estimatedLifeKm: "" };
    if (type === "Carro") {
      setFormData((f) => ({ ...f, type, tireCount: "4", ...reset }));
      return;
    }
    if (type === "Moto") {
      setFormData((f) => ({ ...f, type, tireCount: "2", ...reset }));
      return;
    }
    setFormData((f) => ({ ...f, type, tireCount: "", ...reset }));
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
      estimatedLifeKm: "",
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
        return "bg-[var(--bg-page)] text-[var(--text-secondary)]";
    }
  };

  const selectCls = "h-11 w-full rounded-xl border px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {fleetLoading && (
        <div
          className="mb-5 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
        >
          Carregando frota da nuvem…
        </div>
      )}

      {/* Add Vehicle Form */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Car className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold md:text-lg" style={{ color: "var(--text-primary)" }}>Cadastrar Novo Veículo</h3>
              <p className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>
                Pneus gerados automaticamente — use o catálogo local para fabricante e modelo
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Tipo de Veículo</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className={selectCls}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Marca do veículo</label>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Fabricante do pneu</label>
                <Autocomplete<string, false, false, true>
                  freeSolo
                  disablePortal
                  sx={muiRounded}
                  options={fabricantesOptions}
                  filterOptions={(options, params) =>
                    options.filter((o) =>
                      o.toLowerCase().includes(params.inputValue.toLowerCase()))}
                  value={formData.tireManufacturer === "" ? null : formData.tireManufacturer}
                  inputValue={formData.tireManufacturer}
                  onInputChange={(_, val) =>
                    setFormData((f) => ({
                      ...f,
                      tireManufacturer: val ?? "",
                      tireModel: "",
                      estimatedLifeKm: "",
                    }))}
                  onChange={(_, v) =>
                    setFormData((f) => ({
                      ...f,
                      tireManufacturer: typeof v === "string" ? v : v ?? "",
                      tireModel: "",
                      estimatedLifeKm: "",
                    }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={
                        formData.type
                          ? "Filtrado por tipo de veículo"
                          : "Selecione o tipo de veículo primeiro"
                      }
                      size="small"
                      required
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>
                  Modelo do pneu <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <select
                      value={formData.tireModel}
                      disabled={!formData.type}
                      required
                      className={`${selectCls} disabled:cursor-not-allowed disabled:opacity-50`}
                      onChange={(e) => {
                        const val = e.target.value;
                        const entry = val
                          ? findCatalogEntry(formData.tireManufacturer, val)
                          : null;
                        setFormData((f) => ({
                          ...f,
                          tireModel: val,
                          estimatedLifeKm: "",
                          ...(entry ? { tireQualityTier: entry.tier } : {}),
                        }));
                      }}
                    >
                      <option value="">
                        {!formData.type
                          ? "Selecione o tipo de veículo primeiro"
                          : "Escolha um modelo"}
                      </option>
                      {modelosAgrupados && (
                        <>
                          {modelosAgrupados.economico.length > 0 && (
                            <optgroup label="Econômico">
                              {modelosAgrupados.economico.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                          )}
                          {modelosAgrupados.intermediario.length > 0 && (
                            <optgroup label="Intermediário">
                              {modelosAgrupados.intermediario.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                          )}
                          {modelosAgrupados.premium.length > 0 && (
                            <optgroup label="Premium">
                              {modelosAgrupados.premium.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      )}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 whitespace-nowrap text-sm sm:self-start"
                    disabled={!formData.tireModel.trim()}
                    onClick={() => void handleFetchSpecs()}
                  >
                    Buscar specs
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>
                  Linha dos pneus (modelo empírico)
                </label>
                <select
                  value={formData.tireQualityTier}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      tireQualityTier: e.target.value as TireQualityTier,
                      estimatedLifeKm: "",
                    }))
                  }
                  className={selectCls}
                  required
                >
                  <option value="economico">Econômico — desgaste relativo maior</option>
                  <option value="intermediario">Intermediário — referência</option>
                  <option value="premium">Premium — desgaste relativo menor</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Vida útil estimada (km)"
                placeholder="Ex.: 60000 — use Buscar specs"
                type="number"
                min="0"
                value={formData.estimatedLifeKm}
                onChange={(e) => setFormData({ ...formData, estimatedLifeKm: e.target.value })}
              />
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
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Quantidade de pneus:{" "}
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formData.tireCount}</span>
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
              <h3 className="text-base font-semibold md:text-lg" style={{ color: "var(--text-primary)" }}>Veículos cadastrados</h3>
              <p className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>{filteredVehicles.length} veículo(s) encontrado(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>Filtrar:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 rounded-xl border px-3 text-xs transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 md:px-4 md:text-sm border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"
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
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)" }}
                >
                  {["Tipo", "Marca", "Modelo", "Ano", "Placa", "Pneus", "Pneu (fab./modelo / linha)", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.id}
                    className="transition-colors last:border-0"
                    style={{
                      borderBottom: index < filteredVehicles.length - 1 ? "1px solid var(--border-color)" : undefined,
                      backgroundColor: index % 2 === 0 ? "var(--bg-card)" : "var(--bg-page)",
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getVehicleBadgeColor(vehicle.type)}`}
                      >
                        {getVehicleIcon(vehicle.type)}
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{vehicle.brand}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{vehicle.model}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{vehicle.year}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="rounded-md px-2 py-1 font-mono text-xs"
                        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
                      >
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{vehicle.tireCount}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {vehicle.tireManufacturer} {vehicle.tireModel}
                      <span className="mt-0.5 block text-xs" style={{ color: "var(--text-secondary)" }}>
                        Linha:{" "}
                        {vehicle.tireQualityTier === "economico"
                          ? "Econômico"
                          : vehicle.tireQualityTier === "premium"
                            ? "Premium"
                            : "Intermediário"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm" type="button" onClick={() => void removeVehicle(vehicle.id)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="space-y-3 rounded-xl border p-4"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getVehicleBadgeColor(vehicle.type)}`}
                      >
                        {getVehicleIcon(vehicle.type)}
                        {vehicle.type}
                      </span>
                    </div>
                    <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>{vehicle.brand} {vehicle.model}</h4>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      Pneus: {vehicle.tireManufacturer} {vehicle.tireModel} • Linha{" "}
                      {vehicle.tireQualityTier === "economico"
                        ? "Econômico"
                        : vehicle.tireQualityTier === "premium"
                          ? "Premium"
                          : "Intermediário"}
                    </p>
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 gap-3 border-t pt-2"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Ano</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Placa</p>
                    <p className="text-sm font-mono font-medium" style={{ color: "var(--text-primary)" }}>{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Quantidade pneus</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{vehicle.tireCount}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => void removeVehicle(vehicle.id)}
                  className="h-10 w-full text-sm"
                >
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
