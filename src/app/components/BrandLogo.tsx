export const BRAND_LOGO_SRC = "/brand/ecopneus-logo.png";

type BrandLogoProps = {
  className?: string;
  /** Logo em cartão branco — útil sobre fundos coloridos (login/cadastro) */
  elevated?: boolean;
};

export function BrandLogo({ className = "h-10 w-auto max-w-[200px]", elevated = false }: BrandLogoProps) {
  const img = (
    <img
      src={BRAND_LOGO_SRC}
      alt="EcoPneus — Soluções Sustentáveis"
      className={`object-contain object-left ${className}`}
      width={220}
      height={88}
    />
  );

  if (elevated) {
    return (
      <div className="inline-flex rounded-2xl bg-white p-2 shadow-sm">
        {img}
      </div>
    );
  }

  return img;
}
