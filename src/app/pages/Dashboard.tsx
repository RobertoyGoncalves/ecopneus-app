import { Card, CardContent, CardHeader } from "../components/Card";
import { CircleDot, Car, Map, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const metricsData = [
  {
    title: "Vida Média dos Pneus",
    value: "85.2%",
    icon: CircleDot,
    color: "bg-green-500",
    change: "+5.2%",
  },
  {
    title: "Veículos Cadastrados",
    value: "42",
    icon: Car,
    color: "bg-blue-500",
    change: "+5",
  },
  {
    title: "Pneus Cadastrados",
    value: "148",
    icon: CircleDot,
    color: "bg-purple-500",
    change: "+8",
  },
  {
    title: "Viagens Registradas",
    value: "1,247",
    icon: Map,
    color: "bg-orange-500",
    change: "+143",
  },
];

const recentTrips = [
  { id: 1, vehicle: "Volvo FH 540", type: "Caminhão", distance: "1,245 km", date: "05/04/2026", value: "R$ 8.450,00", status: "Concluída" },
  { id: 2, vehicle: "Toyota Corolla", type: "Carro", distance: "890 km", date: "04/04/2026", value: "R$ 6.200,00", status: "Concluída" },
  { id: 3, vehicle: "Mercedes Actros", type: "Caminhão", distance: "2,100 km", date: "03/04/2026", value: "R$ 12.800,00", status: "Concluída" },
  { id: 4, vehicle: "Honda CG 160", type: "Moto", distance: "120 km", date: "02/04/2026", value: "R$ 450,00", status: "Concluída" },
  { id: 5, vehicle: "VW Golf", type: "Carro", distance: "450 km", date: "01/04/2026", value: "R$ 1.300,00", status: "Concluída" },
];

const chartData = [
  { month: "Jan", viagens: 85, custo: 45 },
  { month: "Fev", viagens: 92, custo: 52 },
  { month: "Mar", viagens: 108, custo: 48 },
  { month: "Abr", viagens: 120, custo: 55 },
  { month: "Mai", viagens: 115, custo: 50 },
  { month: "Jun", viagens: 130, custo: 58 },
];

const tireHealthData = [
  { name: "Excelente", value: 65 },
  { name: "Bom", value: 25 },
  { name: "Atenção", value: 8 },
  { name: "Crítico", value: 2 },
];

export function Dashboard() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Visão geral do sistema de gestão de veículos</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{metric.title}</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">{metric.value}</h3>
                    <p className="text-xs md:text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      {metric.change}
                    </p>
                  </div>
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Viagens Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Viagens e Custos Mensais</h3>
            <p className="text-xs md:text-sm text-gray-600">Análise dos últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="viagens" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                <Line type="monotone" dataKey="custo" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tire Health Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Saúde dos Pneus</h3>
            <p className="text-xs md:text-sm text-gray-600">Distribuição por condição</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <BarChart data={tireHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card>
        <CardHeader>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Últimas Viagens</h3>
          <p className="text-xs md:text-sm text-gray-600">Histórico recente de viagens realizadas</p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Veículo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Tipo</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Distância</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Data</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Valor</th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, index) => (
                  <tr
                    key={trip.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-900">{trip.vehicle}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.distance}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.date}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-green-600 font-medium">{trip.value}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-4">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{trip.vehicle}</h4>
                    <p className="text-xs text-gray-500 mt-1">{trip.date}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    {trip.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Distância</p>
                    <p className="text-sm font-medium text-gray-900">{trip.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-medium text-green-600">{trip.value}</p>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    {trip.status}
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
