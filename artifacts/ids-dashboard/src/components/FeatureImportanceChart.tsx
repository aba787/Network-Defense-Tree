import { Skeleton } from "@/components/ui/skeleton";

interface Feature {
  feature: string;
  importance: number;
  rank: number;
}

interface Props {
  data?: Feature[];
  loading: boolean;
  limit?: number;
}

export function FeatureImportanceChart({ data, loading, limit = 10 }: Props) {
  if (loading || !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  const displayed = data.slice(0, limit);
  const maxImportance = Math.max(...displayed.map((d) => d.importance));

  return (
    <div className="space-y-2">
      {displayed.map((item) => {
        const pct = (item.importance / maxImportance) * 100;
        const importancePct = (item.importance * 100).toFixed(2);
        return (
          <div key={item.feature} className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground w-4 text-right font-mono">
              #{item.rank}
            </span>
            <span className="text-xs text-foreground font-mono w-36 truncate" title={item.feature}>
              {item.feature}
            </span>
            <div className="flex-1 h-4 bg-muted/50 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, hsl(224 76% 48% / 0.9), hsl(224 76% 68% / 0.7))`,
                }}
              />
            </div>
            <span className="text-[10px] text-primary font-mono w-12 text-right">
              {importancePct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
