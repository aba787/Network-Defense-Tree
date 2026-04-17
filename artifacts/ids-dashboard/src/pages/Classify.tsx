import { useState } from "react";
import { useClassifyTraffic, useGetTrafficLog, getGetTrafficLogQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { TrafficLog } from "@/components/TrafficLog";

const NORMAL_PRESET = {
  duration: 0, protocolType: 0, service: 0, flag: 0,
  srcBytes: 181, dstBytes: 5450, land: 0, wrongFragment: 0,
  urgent: 0, hot: 0, numFailedLogins: 0, loggedIn: 1,
  numCompromised: 0, count: 8, srvCount: 8, serrorRate: 0,
  srvSerrorRate: 0, rerrorRate: 0, sameSrvRate: 1, diffSrvRate: 0,
};

const ATTACK_PRESET = {
  duration: 0, protocolType: 0, service: 0, flag: 3,
  srcBytes: 0, dstBytes: 0, land: 0, wrongFragment: 0,
  urgent: 0, hot: 0, numFailedLogins: 0, loggedIn: 0,
  numCompromised: 0, count: 511, srvCount: 511, serrorRate: 1,
  srvSerrorRate: 1, rerrorRate: 0, sameSrvRate: 1, diffSrvRate: 0,
};

type FormData = typeof NORMAL_PRESET;

const FIELD_LABELS: Record<keyof FormData, string> = {
  duration: "Duration (sec)",
  protocolType: "Protocol Type",
  service: "Service",
  flag: "Flag",
  srcBytes: "Src Bytes",
  dstBytes: "Dst Bytes",
  land: "Land",
  wrongFragment: "Wrong Fragment",
  urgent: "Urgent",
  hot: "Hot",
  numFailedLogins: "Failed Logins",
  loggedIn: "Logged In",
  numCompromised: "Compromised",
  count: "Count",
  srvCount: "Srv Count",
  serrorRate: "SYN Error Rate",
  srvSerrorRate: "Srv SYN Err Rate",
  rerrorRate: "REJ Error Rate",
  sameSrvRate: "Same Srv Rate",
  diffSrvRate: "Diff Srv Rate",
};

export default function Classify() {
  const [form, setForm] = useState<FormData>(NORMAL_PRESET);
  const [result, setResult] = useState<{
    label: string;
    confidence: number;
    isAttack: boolean;
    attackType: string | null;
    processingTimeMs: number;
  } | null>(null);

  const queryClient = useQueryClient();
  const { data: logData, isLoading: logLoading } = useGetTrafficLog({ query: { queryKey: getGetTrafficLogQueryKey() } });

  const mutation = useClassifyTraffic({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: getGetTrafficLogQueryKey() });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ data: form });
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const keys = Object.keys(NORMAL_PRESET) as (keyof FormData)[];
  const leftKeys = keys.slice(0, 10);
  const rightKeys = keys.slice(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
            <Activity className="text-primary" />
            Live Traffic Classifier
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Input network features — Decision Tree returns Normal or Attack
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => { setForm(NORMAL_PRESET); setResult(null); }}
          >
            Load Normal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => { setForm(ATTACK_PRESET); setResult(null); }}
          >
            Load Attack
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  Network Traffic Features
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {leftKeys.map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                          {FIELD_LABELS[key]}
                        </Label>
                        <Input
                          type="number"
                          step="any"
                          value={form[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="h-8 text-xs font-mono bg-muted/30 border-border"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {rightKeys.map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                          {FIELD_LABELS[key]}
                        </Label>
                        <Input
                          type="number"
                          step="any"
                          value={form[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="h-8 text-xs font-mono bg-muted/30 border-border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full font-mono uppercase tracking-widest text-sm"
                  >
                    {mutation.isPending ? "Classifying..." : "Classify Traffic"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
          {result && (
            <Card className={`border-2 ${result.isAttack ? "border-destructive/50 bg-destructive/5" : "border-primary/50 bg-primary/5"}`}>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  {result.isAttack ? (
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  )}
                  Classification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-3">
                  <div
                    className={`inline-flex items-center justify-center h-20 w-20 rounded-full border-2 mx-auto ${
                      result.isAttack
                        ? "border-destructive bg-destructive/20 text-destructive"
                        : "border-primary bg-primary/20 text-primary"
                    }`}
                  >
                    {result.isAttack ? (
                      <ShieldAlert className="h-10 w-10" />
                    ) : (
                      <ShieldCheck className="h-10 w-10" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xl font-bold font-mono uppercase tracking-wider ${
                        result.isAttack ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {result.label}
                    </div>
                    <div className="text-3xl font-bold mt-2">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-mono uppercase">Attack Type</span>
                    <span className="font-mono">
                      {result.attackType ? (
                        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
                          {result.attackType}
                        </Badge>
                      ) : (
                        <span className="text-primary">None</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-mono uppercase">Processing</span>
                    <span className="font-mono text-muted-foreground">{result.processingTimeMs}ms</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.isAttack ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {!result && (
            <Card className="border-border bg-card">
              <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Submit traffic features to get a classification result</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Recent Classifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TrafficLog log={logData} loading={logLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
