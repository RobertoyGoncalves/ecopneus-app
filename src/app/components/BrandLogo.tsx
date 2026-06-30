const LOGO_LIGHT = "/brand/ecopneus-logo-light.png"; // with ECOPNEUS text — light theme
const LOGO_DARK  = "/brand/ecopneus-logo-dark.png";  // icon only — dark theme

type BrandLogoProps = {
  className?: string;
  /** Wrap in a white card (e.g. on coloured backgrounds like login) */
  elevated?: boolean;
};

export function BrandLogo({
  className = "h-10 w-auto max-w-[200px]",
  elevated = false,
}: BrandLogoProps) {
  const sharedImgClass = `object-contain object-left ${className}`;

  const logos = (
    <>
      {/* Light theme: logo with text */}
      <img
        src={LOGO_LIGHT}
        alt="EcoPneus"
        className={`${sharedImgClass} block dark:hidden`}
        width={220}
        height={88}
        draggable={false}
      />
      {/* Dark theme: icon-only variant */}
      <img
        src={LOGO_DARK}
        alt="EcoPneus"
        className={`${sharedImgClass} hidden dark:block`}
        width={220}
        height={88}
        draggable={false}
      />
    </>
  );

  if (elevated) {
    return (
      <div className="inline-flex rounded-2xl bg-white p-2 shadow-sm dark:bg-white/10">
        {logos}
      </div>
    );
  }

  return <>{logos}</>;
}

/** Raw path for contexts that need the src string directly. */
export const BRAND_LOGO_SRC = LOGO_LIGHT;
