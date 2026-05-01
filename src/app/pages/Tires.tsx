import { useState } from "react";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { CircleDot, Plus } from "lucide-react";

interface Tire {
  id: number;
  model: string;
  brand: string;
  axis: string;
  health: number;
  vehicleType: string;
  vehicle: string;
}

export function Tires() {
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("Todos");
  const [tires, setTires] = useState<Tire[]>([
    { id: 1, model: "XZY Premium", brand: "Michelin", axis: "Dianteiro", health: 95, vehicleType: "Caminhão", vehicle: "Volvo FH 540" },
    { id: 2, model: "Road Pro", brand: "Pirelli", axis: "Traseiro", health: 88, vehicleType: "Carro", vehicle: "Toyota Corolla" },
    { id: 3, model: "Eco Drive", brand: "Goodyear", axis: "Dianteiro", health: 92, vehicleType: "Caminhão", vehicle: "Scania R450" },
    { id: 4, model: "Duramax", brand: "Bridgestone", axis: "Traseiro", health: 78, vehicleType: "Carro", vehicle: "Honda Civic" },
    { id: 5, model: "Sport Grip", brand: "Michelin", axis: "Traseiro", health: 85, vehicleType: "Moto", vehicle: "Honda CG 160" },
    { id: 6, model: "Heavy Duty", brand: "Continental", axis: "Dianteiro", health: 45, vehicleType: "Caminhão", vehicle: "Mercedes Actros" },
    { id: 7, model: "Long Life", brand: "Pirelli", axis: "Traseiro", health: 90, vehicleType: "Carro", vehicle: "VW Golf" },
    { id: 8, model: "City Ride", brand: "Goodyear", axis: "Dianteiro", health: 25, vehicleType: "Moto", vehicle: "Yamaha Factor" },
  ]);

  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    axis: "",
    health: "",
    vehicleType: "",
    vehicle: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTire: Tire = {
      id: Date.now(),
      model: formData.model,
      brand: formData.brand,
      axis: formData.axis,
      health: Number(formData.health),
      vehicleType: formData.vehicleType,
      vehicle: formData.vehicle,
    };
    setTires([...tires, newTire]);
    setFormData({ model: "", brand: "", axis: "", health: "", vehicleType: "", vehicle: "" });
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

  const filteredTires = filterType === "Todos"
    ? tires
    : tires.filter((t) => t.vehicleType === filterType);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Pneus</h1>
          <p className="text-sm md:text-base text-gray-600">Monitore e gerencie os pneus de todos os seus veículos</p>
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
            <span className="text-sm md:text-base">Novo Pneu</span>
          </Button>
        </div>
      </div>

      {/* Add Tire Form */}
      {showForm && (
        <Card className="mb-6 md:mb-8">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tipo de Veículo</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>
                <Input
                  label="Veículo Vinculado"
                  placeholder="Ex: Volvo FH 540"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  required
                />
                <Input
                  label="Eixo"
                  placeholder="Dianteiro/Traseiro"
                  value={formData.axis}
                  onChange={(e) => setFormData({ ...formData, axis: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Modelo"
                  placeholder="Ex: XZY Premium"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
                <Input
                  label="Marca"
                  placeholder="Ex: Michelin"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
                <Input
                  label="Vida Útil (%)"
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
                  Adicionar Pneu
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tires Grid */}
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
                {tire.vehicleType} - {tire.vehicle}
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
                        tire.health >= 80 ? "bg-green-500" :
                        tire.health >= 50 ? "bg-yellow-500" :
                        "bg-red-500"
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
