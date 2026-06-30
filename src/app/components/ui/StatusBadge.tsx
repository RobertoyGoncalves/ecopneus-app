interface StatusBadgeProps {
  status: string;
  label?: string;
}

type BadgeConfig = { bg: string; text: string; defaultLabel: string };

const STATUS_MAP: Record<string, BadgeConfig> = {
  normal: { bg: "bg-green-100", text: "text-green-700", defaultLabel: "Normal" },
  excelente: { bg: "bg-green-100", text: "text-green-700", defaultLabel: "Excelente" },
  bom: { bg: "bg-blue-100", text: "text-blue-700", defaultLabel: "Bom" },
  atencao: { bg: "bg-yellow-100", text: "text-yellow-700", defaultLabel: "Atenção" },
  medio: { bg: "bg-yellow-100", text: "text-yellow-700", defaultLabel: "Médio" },
  critico: { bg: "bg-red-100", text: "text-red-700", defaultLabel: "Crítico" },
  alto: { bg: "bg-red-100", text: "text-red-700", defaultLabel: "Alto" },
  baixo: { bg: "bg-green-100", text: "text-green-700", defaultLabel: "Baixo" },
  concluida: { bg: "bg-green-100", text: "text-green-700", defaultLabel: "Concluída" },
  caminhao: { bg: "bg-blue-100", text: "text-blue-700", defaultLabel: "Caminhão" },
  carro: { bg: "bg-purple-100", text: "text-purple-700", defaultLabel: "Carro" },
  moto: { bg: "bg-orange-100", text: "text-orange-700", defaultLabel: "Moto" },
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = normalize(status);
  const config: BadgeConfig = STATUS_MAP[key] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    defaultLabel: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {label ?? config.defaultLabel}
    </span>
  );
}
