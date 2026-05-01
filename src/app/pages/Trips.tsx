import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { MapPin } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";

interface Trip {
  id: number;
  vehicle: string;
  vehicleType: string;
  distance: string;
  weight: string;
  value: string;
  type: string;
  hasCargo: boolean;
  date: string;
  estimatedWear: number;
  wearLevel: "Baixo" | "Médio" | "Alto";
  tireCount: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const averageCargoByVehicleType: Record<string, { weight: string; value: string; type: string }> = {
  Carro: { weight: "120", value: "400", type: "Carga Leve" },
  Moto: { weight: "25", value: "180", type: "Entrega Leve" },
  Caminhão: { weight: "12000", value: "8000", type: "Carga Geral" },
};

const calculateEstimatedWear = (vehicleType: string, distanceValue: string, weightValue: string) => {
  const distance = Math.max(0, Number(distanceValue) || 0);
  const weight = Math.max(0, Number(weightValue) || 0);

  if (!distance || !vehicleType) return 0;

  const baseByVehicleType: Record<string, number> = {
    Carro: 2,
    Moto: 1.5,
    Caminhão: 3,
  };
  const weightReferenceByType: Record<string, number> = {
    Carro: 500,
    Moto: 120,
    Caminhão: 12000,
  };

  const typeBase = baseByVehicleType[vehicleType] ?? 2;
  const distanceFactor = clamp(distance / 300, 0, 12);
  const weightReference = weightReferenceByType[vehicleType] ?? 500;
  const normalizedWeight = clamp(weight / weightReference, 0, 3);
  const weightFactor = 0.7 + normalizedWeight * 0.3;

  const rawWear = typeBase * distanceFactor * weightFactor;
  return Number(clamp(rawWear, 0, 100).toFixed(1));
};

const getWearLevel = (estimatedWear: number): "Baixo" | "Médio" | "Alto" => {
  if (estimatedWear >= 66) return "Alto";
  if (estimatedWear >= 33) return "Médio";
  return "Baixo";
};

export function Trips() {
  const { vehicles } = useFleet();

  const [filterType, setFilterType] = useState("Todos");
  const [trips, setTrips] = useState<Trip[]>([
    { id: 1, vehicle: "Volvo FH 540 • ABC-1234", vehicleType: "Caminhão", distance: "1245", weight: "25000", value: "8450.00", type: "Carga Geral", hasCargo: true, date: "05/04/2026", estimatedWear: 18.2, wearLevel: "Baixo", tireCount: 10 },
    { id: 2, vehicle: "Toyota Corolla • XYZ-5678", vehicleType: "Carro", distance: "890", weight: "500", value: "6200.00", type: "Executivo", hasCargo: true, date: "04/04/2026", estimatedWear: 6.8, wearLevel: "Baixo", tireCount: 4 },
    { id: 3, vehicle: "Honda CG 160 • DEF-9012", vehicleType: "Moto", distance: "120", weight: "0", value: "0", type: "Sem carga", hasCargo: false, date: "02/04/2026", estimatedWear: 0.4, wearLevel: "Baixo", tireCount: 2 },
  ]);

  const [formData, setFormData] = useState({
    fleetVehicleId: "",
    vehicle: "",
    vehicleType: "",
    distance: "",
    hasCargo: false,
    weight: "",
    value: "",
    type: "",
  });

  const vehiclesForType = useMemo(
    () => vehicles.filter((v) => v.type === formData.vehicleType),
    [vehicles, formData.vehicleType]
  );

  const selectedFleetVehicle =
    formData.fleetVehicleId !== ""
      ? vehicles.find((v) => String(v.id) === formData.fleetVehicleId)
      : undefined;

  const handleVehicleTypeChange = (vehicleType: string) => {
    setFormData((current) => {
      const next = { ...current, vehicleType, fleetVehicleId: "", vehicle: "" };
      if (current.hasCargo && vehicleType) {
        const avg = averageCargoByVehicleType[vehicleType];
        if (avg) {
          next.weight = avg.weight;
          next.value = avg.value;
          next.type = avg.type;
        }
      }
      return next;
    });
  };

  const handleFleetVehicleChange = (idStr: string) => {
    if (!idStr) {
      setFormData((c) => ({ ...c, fleetVehicleId: "", vehicle: "" }));
      return;
    }
    const v = vehicles.find((x) => String(x.id) === idStr);
    if (!v) return;
    setFormData((c) => ({
      ...c,
      fleetVehicleId: idStr,
      vehicle: formatVehicleLabel(v),
    }));
  };

  const handleHasCargoChange = (hasCargo: boolean) => {
    if (!hasCargo) {
      setFormData((current) => ({ ...current, hasCargo: false, weight: "", value: "", type: "" }));
      return;
    }

    setFormData((current) => {
      const next = { ...current, hasCargo: true };
      const vt = current.vehicleType;
      const average = vt ? averageCargoByVehicleType[vt] : undefined;
      if (average) {
        next.weight = average.weight;
        next.value = average.value;
        next.type = average.type;
      }
      return next;
    });
  };

  const weightForCalculation = formData.hasCargo ? formData.weight : "0";
  const estimatedWear = calculateEstimatedWear(formData.vehicleType, formData.distance, weightForCalculation);
  const wearLevel = getWearLevel(estimatedWear);
  const tireCount = selectedFleetVehicle?.tireCount ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = formData.hasCargo ? formData.weight : "0";
    const finalValue = formData.hasCargo ? formData.value : "0";
    const finalType = formData.hasCargo ? formData.type : "Sem carga";

    if (!selectedFleetVehicle) return;

    const newTrip: Trip = {
      id: Date.now(),
      vehicle: formData.vehicle,
      vehicleType: formData.vehicleType,
      distance: formData.distance,
      weight: finalWeight,
      value: finalValue,
      type: finalType,
      hasCargo: formData.hasCargo,
      date: new Date().toLocaleDateString("pt-BR"),
      estimatedWear,
      wearLevel,
      tireCount,
    };
    setTrips([newTrip, ...trips]);
    setFormData({
      fleetVehicleId: "",
      vehicle: "",
      vehicleType: "",
      distance: "",
      hasCargo: false,
      weight: "",
      value: "",
      type: "",
    });
  };

  const filteredTrips = filterType === "Todos"
    ? trips
    : trips.filter((t) => t.vehicleType === filterType);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Viagens</h1>
        <p className="text-sm md:text-base text-gray-600">Registre e acompanhe as viagens da sua frota</p>
      </div>

      {/* Add Trip Form */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Registrar Nova Viagem</h3>
              <p className="text-xs md:text-sm text-gray-600">Preencha os dados da viagem</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo de Veículo</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
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
                  Veículo cadastrado
                </label>
                <select
                  value={formData.fleetVehicleId}
                  disabled={!formData.vehicleType || vehiclesForType.length === 0}
                  onChange={(e) => handleFleetVehicleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                  required
                >
                  <option value="">
                    {!formData.vehicleType
                      ? "Primeiro escolha o tipo"
                      : vehiclesForType.length === 0
                        ? "Nenhum veículo deste tipo — cadastre em Veículos"
                        : "Selecione o veículo"}
                  </option>
                  {vehiclesForType.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {formatVehicleLabel(v)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Distância (km)"
                placeholder="1000"
                type="number"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Tem carga?</span>
              <button
                type="button"
                onClick={() => handleHasCargoChange(true)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleHasCargoChange(false)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  !formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                Não
              </button>
            </div>

            {formData.hasCargo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Peso da Carga (kg)"
                  placeholder="25000"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required={formData.hasCargo}
                />
                <Input
                  label="Valor da Carga (R$)"
                  placeholder="5000.00"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required={formData.hasCargo}
                />
                <Input
                  label="Tipo de Carga"
                  placeholder="Ex: Carga Geral"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required={formData.hasCargo}
                />
              </div>
            )}

            {selectedFleetVehicle?.type === "Caminhão" && (
              <p className="text-sm text-gray-600 md:col-span-3">
                Pneus para o cálculo: <span className="font-semibold text-gray-900">{selectedFleetVehicle.tireCount}</span>{" "}
                (conforme cadastro em Veículos)
              </p>
            )}

            {formData.vehicleType && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  Valor de Desgaste Estimado: <span className="font-semibold text-gray-900">{estimatedWear}%</span>
                </p>
                <p className="text-sm text-gray-700">
                  Nível de Desgaste: <span className="font-semibold text-gray-900">{wearLevel}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Número de Pneus que sofrerão desgaste:{" "}
                  <span className="font-semibold text-gray-900">{tireCount > 0 ? tireCount : "—"}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Uso de carga: <span className="font-semibold text-gray-900">{formData.hasCargo ? "Sim" : "Não"}</span>
                </p>
              </div>
            )}

            <Button type="submit" variant="primary">
              Registrar Viagem
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Viagens Registradas</h3>
              <p className="text-xs md:text-sm text-gray-600">{filteredTrips.length} viagens encontrada(s)</p>
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
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Veículo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Tipo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Distância (km)</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Tem carga?</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Peso (kg)</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Desgaste</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Pneus</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Valor</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Uso</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, index) => (
                  <tr
                    key={trip.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-900 font-medium">{trip.vehicle}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.distance}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.hasCargo ? "Sim" : "Não"}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{Number(trip.weight).toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="text-sm font-medium text-gray-900">{trip.estimatedWear}%</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          trip.wearLevel === "Alto"
                            ? "bg-red-100 text-red-700"
                            : trip.wearLevel === "Médio"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {trip.wearLevel}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.tireCount}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-green-600 font-medium">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-3 p-4">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm md:text-base">{trip.vehicle}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                      <span className="text-xs text-gray-500">{trip.date}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Distância</p>
                    <p className="text-sm font-medium text-gray-900">{trip.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tem carga?</p>
                    <p className="text-sm font-medium text-gray-900">{trip.hasCargo ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="text-sm font-medium text-gray-900">{Number(trip.weight).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Desgaste</p>
                    <p className="text-sm font-medium text-gray-900">{trip.estimatedWear}% ({trip.wearLevel})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pneus afetados</p>
                    <p className="text-sm font-medium text-gray-900">{trip.tireCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-medium text-green-600">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    {trip.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
