import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TrafficEntry {
  id: number;
  timestamp: string;
  label: string;
  confidence: number;
  isAttack: boolean;
  attackType: string | null;
  srcBytes: number;
  dstBytes: number;
  duration: number;
}

interface Props {
  log?: TrafficEntry[];
  loading: boolean;
}

export function TrafficLog({ log, loading }: Props) {
  if (loading || !log) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (log.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No traffic entries yet. Use the Live Classifier to classify traffic.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-64">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium uppercase tracking-wider">Time</th>
            <th className="px-4 py-2 font-medium uppercase tracking-wider">Label</th>
            <th className="px-4 py-2 font-medium uppercase tracking-wider">Confidence</th>
            <th className="px-4 py-2 font-medium uppercase tracking-wider">Src Bytes</th>
            <th className="px-4 py-2 font-medium uppercase tracking-wider">Dst Bytes</th>
          </tr>
        </thead>
        <tbody>
          {log.map((entry, idx) => (
            <tr
              key={entry.id}
              className={`border-b border-border/50 transition-colors ${
                entry.isAttack ? "hover:bg-destructive/5" : "hover:bg-muted/20"
              }`}
            >
              <td className="px-4 py-2 text-muted-foreground font-mono">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </td>
              <td className="px-4 py-2">
                <Badge
                  variant={entry.isAttack ? "destructive" : "default"}
                  className={`text-[10px] font-mono ${
                    entry.isAttack
                      ? "bg-destructive/20 text-destructive border-destructive/30"
                      : "bg-primary/20 text-primary border-primary/30"
                  }`}
                >
                  {entry.label}
                </Badge>
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground">
                <span
                  className={entry.confidence > 0.85 ? "text-emerald-400" : "text-amber-400"}
                >
                  {(entry.confidence * 100).toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground">
                {entry.srcBytes.toLocaleString()}
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground">
                {entry.dstBytes.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
