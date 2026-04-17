import { useGetModelStats, getGetModelStatsQueryKey, useGetFeatureImportance, getGetFeatureImportanceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart, Shield, Target, Brain } from "lucide-react";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Results() {
  const { data: stats, isLoading: statsLoading } = useGetModelStats({ query: { queryKey: getGetModelStatsQueryKey() } });
  const { data: features, isLoading: featuresLoading } = useGetFeatureImportance({ query: { queryKey: getGetFeatureImportanceQueryKey() } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
          <FileBarChart className="text-primary" />
          Model Results
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full Decision Tree evaluation report — KDD Cup 99 benchmark
        </p>
      </div>

      {/* Model Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Accuracy", value: stats ? `${(stats.accuracy * 100).toFixed(2)}%` : null, icon: <Target className="h-4 w-4 text-primary" /> },
          { label: "Total Samples", value: stats ? stats.totalSamples.toLocaleString() : null, icon: <Shield className="h-4 w-4 text-blue-400" /> },
          { label: "Train / Test Split", value: stats ? `70 / 30` : null, icon: <Brain className="h-4 w-4 text-amber-400" /> },
          { label: "Features Used", value: stats ? `${stats.numFeatures}` : null, icon: <FileBarChart className="h-4 w-4 text-emerald-400" /> },
        ].map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</span>
                {item.icon}
              </div>
              {statsLoading || !item.value ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <span className="text-2xl font-bold font-mono">{item.value}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Classification Report */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Classification Report — Per-Class Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {statsLoading || !stats ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4 font-medium uppercase tracking-wider">Class</th>
                    <th className="py-2 px-4 font-medium uppercase tracking-wider text-center">Precision</th>
                    <th className="py-2 px-4 font-medium uppercase tracking-wider text-center">Recall</th>
                    <th className="py-2 px-4 font-medium uppercase tracking-wider text-center">F1-Score</th>
                    <th className="py-2 px-4 font-medium uppercase tracking-wider text-center">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.classMetrics.map((m) => (
                    <tr key={m.label} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4">
                        <span
                          className={`font-bold uppercase text-sm ${
                            m.label === "Normal" ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {m.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <MetricCell value={m.precision} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <MetricCell value={m.recall} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <MetricCell value={m.f1} />
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {m.support.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-3 pr-4 text-foreground uppercase">Weighted Avg</td>
                    <td className="py-3 px-4 text-center">
                      <MetricCell value={stats.accuracy} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MetricCell value={stats.accuracy} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MetricCell value={stats.accuracy} />
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {stats.testSamples.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Confusion Matrix Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ConfusionMatrix data={stats?.confusionMatrix} loading={statsLoading} />
          </CardContent>
        </Card>

        {/* Feature Importance */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Feature Importance — All Features
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FeatureImportanceChart data={features} loading={featuresLoading} limit={20} />
          </CardContent>
        </Card>
      </div>

      {/* Dataset Info */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Dataset Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Dataset</div>
              <div className="text-foreground font-bold">KDD Cup 99</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Classes</div>
              <div className="text-foreground font-bold">5 (Normal + 4 Attack)</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Algorithm</div>
              <div className="text-foreground font-bold">Decision Tree (CART)</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Tree Depth</div>
              <div className="text-foreground font-bold">{statsLoading ? "..." : stats?.treeDepth}</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded border border-border text-xs text-muted-foreground font-mono leading-relaxed">
            Attack categories: <span className="text-destructive">DoS</span> (Denial of Service), 
            <span className="text-destructive"> Probe</span> (Surveillance/scanning), 
            <span className="text-destructive"> R2L</span> (Remote-to-Local), 
            <span className="text-destructive"> U2R</span> (User-to-Root). 
            The model uses 20 numerical network traffic features to distinguish normal traffic from intrusion attempts.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCell({ value }: { value: number }) {
  const pct = value * 100;
  const color =
    pct >= 95
      ? "text-emerald-400"
      : pct >= 85
      ? "text-primary"
      : pct >= 70
      ? "text-amber-400"
      : "text-destructive";
  return <span className={`${color} font-bold`}>{pct.toFixed(2)}%</span>;
}
