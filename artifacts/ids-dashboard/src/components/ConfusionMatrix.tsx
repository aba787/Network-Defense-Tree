import { Skeleton } from "@/components/ui/skeleton";

interface Cell {
  predicted: string;
  actual: string;
  count: number;
}

interface Props {
  data?: Cell[];
  loading: boolean;
}

export function ConfusionMatrix({ data, loading }: Props) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const classes = Array.from(new Set(data.map((c) => c.actual)));
  const maxCount = Math.max(...data.map((c) => c.count));

  function getCell(actual: string, predicted: string) {
    return data.find((c) => c.actual === actual && c.predicted === predicted)?.count ?? 0;
  }

  function getCellColor(count: number, actual: string, predicted: string) {
    if (count === 0) return "bg-muted/20";
    const intensity = count / maxCount;
    if (actual === predicted) {
      const l = Math.round(20 + intensity * 30);
      return `bg-primary/[${(intensity * 0.8 + 0.15).toFixed(2)}]`;
    }
    return `bg-destructive/[${(intensity * 0.7 + 0.1).toFixed(2)}]`;
  }

  const shortLabel = (l: string) => l.substring(0, 4);

  return (
    <div className="overflow-auto">
      <div className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wider text-center">
        Predicted Label
      </div>
      <div className="flex">
        <div className="flex flex-col justify-end pr-2">
          <div
            className="text-[10px] text-muted-foreground uppercase tracking-wider"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", marginBottom: "4px" }}
          >
            Actual
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-1 text-[10px] text-muted-foreground font-normal text-left w-12"></th>
                {classes.map((c) => (
                  <th key={c} className="p-1 text-[10px] text-muted-foreground font-medium text-center">
                    {shortLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((actual) => (
                <tr key={actual}>
                  <td className="p-1 text-[10px] text-muted-foreground font-medium pr-2 whitespace-nowrap">
                    {shortLabel(actual)}
                  </td>
                  {classes.map((predicted) => {
                    const count = getCell(actual, predicted);
                    const isCorrect = actual === predicted;
                    const intensity = count / maxCount;
                    return (
                      <td key={predicted} className="p-0.5">
                        <div
                          className={`aspect-square flex items-center justify-center rounded text-[10px] font-bold transition-all min-w-[28px] min-h-[28px] ${
                            isCorrect ? "text-primary" : count > 0 ? "text-destructive" : "text-muted-foreground/30"
                          }`}
                          style={{
                            backgroundColor: isCorrect
                              ? `rgba(59, 130, 246, ${0.1 + intensity * 0.6})`
                              : count > 0
                              ? `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`
                              : "transparent",
                          }}
                          title={`Actual: ${actual}, Predicted: ${predicted}, Count: ${count}`}
                        >
                          {count > 0 ? count.toLocaleString() : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary/60"></div>
          <span>Correct</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-destructive/60"></div>
          <span>Misclassified</span>
        </div>
      </div>
    </div>
  );
}
