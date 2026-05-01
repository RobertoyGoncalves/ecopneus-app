import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Trash2 } from "lucide-react";

interface Truck {
  id: number;
  model: string;
  plate: string;
  year: string;
  brand: string;
}

export function Trucks() {
  const [trucks, setTrucks] = useState<Truck[]>([
    { id: 1, model: "Volvo FH 540", plate: "ABC-1234", year: "2022", brand: "Volvo" },
    { id: 2, model: "Scania R450", plate: "DEF-5678", year: "2021", brand: "Scania" },
    { id: 3, model: "Mercedes Actros", plate: "GHI-9012", year: "2023", brand: "Mercedes-Benz" },
  ]);

  const [formData, setFormData] = useState({
    model: "",
    plate: "",
    year: "",
    brand: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTruck: Truck = {
      id: Date.now(),
      ...formData,
    };
    setTrucks([...trucks, newTruck]);
    setFormData({ model: "", plate: "", year: "", brand: "" });
  };

  const handleRemove = (id: number) => {
    setTrucks(trucks.filter(truck => truck.id !== id));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Caminhões</h1>
        <p className="text-gray-600">Gerencie os caminhões da sua frota</p>
      </div>

      {/* Add Truck Form */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Adicionar Novo Caminhão</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Modelo"
                placeholder="Ex: Volvo FH 540"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
              <Input
                label="Placa"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                required
              />
              <Input
                label="Ano"
                placeholder="2023"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
              <Input
                label="Marca"
                placeholder="Ex: Volvo"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <Button type="submit" variant="primary">
              Adicionar Caminhão
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trucks Table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Caminhões Cadastrados</h3>
          <p className="text-sm text-gray-600">{trucks.length} caminhões na frota</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm text-gray-600">Modelo</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-600">Placa</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-600">Ano</th>
                  <th className="text-left px-6 py-4 text-sm text-gray-600">Marca</th>
                  <th className="text-right px-6 py-4 text-sm text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck, index) => (
                  <tr
                    key={truck.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">{truck.model}</td>
                    <td className="px-6 py-4 text-gray-700">{truck.plate}</td>
                    <td className="px-6 py-4 text-gray-700">{truck.year}</td>
                    <td className="px-6 py-4 text-gray-700">{truck.brand}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(truck.id)}
                        className="inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
