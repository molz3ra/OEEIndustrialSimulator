import { formatPercent, getOEEBenchmarkLabel } from "@shared/oee";
import { useTranslation } from "react-i18next";

interface OEEGaugeProps {
  oee: number; // 0 to 1
  size?: number;
  showBenchmark?: boolean;
}

export function OEEGauge({
  oee,
  size = 200,
  showBenchmark = true,
}: OEEGaugeProps) {
  const { i18n } = useTranslation();
  const clampedOEE = Math.min(Math.max(oee, 0), 1);
  const benchmark = getOEEBenchmarkLabel(clampedOEE);

  // SVG circular progress parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - clampedOEE * circumference;

  let strokeColor = "#f43f5e"; // rose-500 (< 50%)
  if (clampedOEE >= 0.85) {
    strokeColor = "#10b981"; // emerald-500
  } else if (clampedOEE >= 0.7) {
    strokeColor = "#3b82f6"; // blue-500
  } else if (clampedOEE >= 0.5) {
    strokeColor = "#f59e0b"; // amber-500
  }

  const label =
    i18n.language === "en" ? benchmark.labelEn : benchmark.labelPt;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary/40 fill-transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="fill-transparent transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            OEE Geral
          </span>
          <span className="font-mono text-4xl font-black text-foreground tracking-tight">
            {formatPercent(clampedOEE)}
          </span>
        </div>
      </div>

      {showBenchmark && (
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${benchmark.color} ${benchmark.bgColor}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
