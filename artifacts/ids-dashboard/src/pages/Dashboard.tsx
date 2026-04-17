import { useGetModelStats, getGetModelStatsQueryKey, useGetTrafficLog, getGetTrafficLogQueryKey, useGetFeatureImportance, getGetFeatureImportanceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Zap, Network, Target, BoxSelect, Cpu } from "lucide-react";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { TrafficLog } from "@/components/TrafficLog";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetModelStats({ query: { queryKey: getGetModelStatsQueryKey() } });
  const { data: trafficLog, isLoading: logLoading } = useGetTrafficLog({ query: { queryKey: getGetTrafficLogQueryKey() } });
  const { data: featureImportance, isLoading: featureLoading } = useGetFeatureImportance({ query: { queryKey: getGetFeatureImportanceQueryKey() } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
            <Activity className="text-primary" />
            Global Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Decision Tree Classifier Live Metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs uppercase text-primary font-medium tracking-wider">System Live</span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Global Accuracy" 
          value={stats ? `${(stats.accuracy * 100).toFixed(2)}%` : null} 
          icon={<Target className="h-4 w-4 text-primary" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Samples Processed" 
          value={stats ? stats.totalSamples.toLocaleString() : null} 
          icon={<Network className="h-4 w-4 text-blue-400" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Decision Tree Depth" 
          value={stats ? stats.treeDepth.toString() : null} 
          icon={<BoxSelect className="h-4 w-4 text-amber-500" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Active Features" 
          value={stats ? stats.numFeatures.toString() : null} 
          icon={<Cpu className="h-4 w-4 text-emerald-400" />} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Recent Traffic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TrafficLog log={trafficLog} loading={logLoading} />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Top Predictive Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FeatureImportanceChart data={featureImportance} loading={featureLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Model Confusion Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ConfusionMatrix data={stats?.confusionMatrix} loading={statsLoading} />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Class Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.classMetrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col gap-2 p-3 rounded bg-muted/50 border border-border">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold uppercase ${metric.label === 'Attack' ? 'text-destructive' : 'text-primary'}`}>
                          {metric.label}
                        </span>
                        <span className="text-xs text-muted-foreground">n={metric.support}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <MetricBar label="Precision" value={metric.precision} />
                        <MetricBar label="Recall" value={metric.recall} />
                        <MetricBar label="F1 Score" value={metric.f1} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value: string | null, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="border-border bg-card overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-20">{icon}</div>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">{title}</p>
        {loading || !value ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <h3 className="text-2xl font-bold font-sans tracking-tight">{value}</h3>
        )}
      </CardContent>
    </Card>
  );
}

function MetricBar({ label, value }: { label: string, value: number }) {
  const percentage = Math.round(value * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
