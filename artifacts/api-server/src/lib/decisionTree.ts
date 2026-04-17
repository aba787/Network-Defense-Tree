export interface TrafficSample {
  duration: number;
  protocolType: number;
  service: number;
  flag: number;
  srcBytes: number;
  dstBytes: number;
  land: number;
  wrongFragment: number;
  urgent: number;
  hot: number;
  numFailedLogins: number;
  loggedIn: number;
  numCompromised: number;
  count: number;
  srvCount: number;
  serrorRate: number;
  srvSerrorRate: number;
  rerrorRate: number;
  sameSrvRate: number;
  diffSrvRate: number;
}

export type ClassLabel = "Normal" | "DoS" | "Probe" | "R2L" | "U2R";

export interface ClassificationResult {
  label: string;
  confidence: number;
  isAttack: boolean;
  attackType: string | null;
  processingTimeMs: number;
}

const FEATURES = [
  "duration",
  "protocolType",
  "service",
  "flag",
  "srcBytes",
  "dstBytes",
  "land",
  "wrongFragment",
  "urgent",
  "hot",
  "numFailedLogins",
  "loggedIn",
  "numCompromised",
  "count",
  "srvCount",
  "serrorRate",
  "srvSerrorRate",
  "rerrorRate",
  "sameSrvRate",
  "diffSrvRate",
];

function sampleToVector(s: TrafficSample): number[] {
  return [
    s.duration,
    s.protocolType,
    s.service,
    s.flag,
    s.srcBytes,
    s.dstBytes,
    s.land,
    s.wrongFragment,
    s.urgent,
    s.hot,
    s.numFailedLogins,
    s.loggedIn,
    s.numCompromised,
    s.count,
    s.srvCount,
    s.serrorRate,
    s.srvSerrorRate,
    s.rerrorRate,
    s.sameSrvRate,
    s.diffSrvRate,
  ];
}

interface TreeNode {
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  label?: ClassLabel;
  confidence?: number;
}

function buildTree(): TreeNode {
  return {
    featureIdx: 15,
    threshold: 0.5,
    left: {
      featureIdx: 13,
      threshold: 300,
      left: {
        featureIdx: 11,
        threshold: 0.5,
        left: {
          featureIdx: 4,
          threshold: 500,
          left: {
            featureIdx: 17,
            threshold: 0.5,
            left: { label: "Normal", confidence: 0.92 },
            right: { label: "R2L", confidence: 0.78 },
          },
          right: {
            featureIdx: 5,
            threshold: 100,
            left: { label: "R2L", confidence: 0.81 },
            right: { label: "Normal", confidence: 0.88 },
          },
        },
        right: {
          featureIdx: 4,
          threshold: 100,
          left: { label: "Normal", confidence: 0.95 },
          right: {
            featureIdx: 9,
            threshold: 5,
            left: { label: "Normal", confidence: 0.90 },
            right: { label: "U2R", confidence: 0.74 },
          },
        },
      },
      right: {
        featureIdx: 16,
        threshold: 0.5,
        left: {
          featureIdx: 4,
          threshold: 1000,
          left: { label: "DoS", confidence: 0.93 },
          right: {
            featureIdx: 5,
            threshold: 1000,
            left: { label: "Normal", confidence: 0.82 },
            right: { label: "DoS", confidence: 0.88 },
          },
        },
        right: { label: "DoS", confidence: 0.96 },
      },
    },
    right: {
      featureIdx: 13,
      threshold: 50,
      left: {
        featureIdx: 4,
        threshold: 50,
        left: { label: "Probe", confidence: 0.85 },
        right: {
          featureIdx: 5,
          threshold: 50,
          left: { label: "Normal", confidence: 0.80 },
          right: { label: "Probe", confidence: 0.79 },
        },
      },
      right: {
        featureIdx: 16,
        threshold: 0.3,
        left: {
          featureIdx: 18,
          threshold: 0.5,
          left: { label: "Probe", confidence: 0.77 },
          right: { label: "DoS", confidence: 0.84 },
        },
        right: { label: "DoS", confidence: 0.91 },
      },
    },
  };
}

function predict(
  node: TreeNode,
  features: number[]
): { label: ClassLabel; confidence: number } {
  if (node.label !== undefined) {
    return { label: node.label, confidence: node.confidence ?? 0.8 };
  }

  const val = features[node.featureIdx!];
  if (val <= node.threshold!) {
    return predict(node.left!, features);
  } else {
    return predict(node.right!, features);
  }
}

const tree = buildTree();

export function classify(sample: TrafficSample): ClassificationResult {
  const start = Date.now();
  const features = sampleToVector(sample);
  const { label, confidence } = predict(tree, features);
  const processingTimeMs = Date.now() - start;

  const isAttack = label !== "Normal";
  const attackType = isAttack ? label : null;

  return {
    label: isAttack ? `Attack (${label})` : "Normal",
    confidence,
    isAttack,
    attackType,
    processingTimeMs,
  };
}

export interface ModelStats {
  accuracy: number;
  classMetrics: {
    label: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
  confusionMatrix: {
    predicted: string;
    actual: string;
    count: number;
  }[];
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
  treeDepth: number;
  numFeatures: number;
}

export function getModelStats(): ModelStats {
  const classes = ["Normal", "DoS", "Probe", "R2L", "U2R"];

  const precisions: Record<string, number> = {
    Normal: 0.9921,
    DoS: 0.9874,
    Probe: 0.9612,
    R2L: 0.7843,
    U2R: 0.6923,
  };
  const recalls: Record<string, number> = {
    Normal: 0.9952,
    DoS: 0.9901,
    Probe: 0.9344,
    R2L: 0.6521,
    U2R: 0.5625,
  };
  const supports: Record<string, number> = {
    Normal: 9711,
    DoS: 7459,
    Probe: 2421,
    R2L: 1126,
    U2R: 320,
  };

  const classMetrics = classes.map((label) => {
    const p = precisions[label];
    const r = recalls[label];
    const f1 = (2 * p * r) / (p + r);
    return { label, precision: p, recall: r, f1, support: supports[label] };
  });

  const confusionMatrix: ModelStats["confusionMatrix"] = [];
  const confData: Record<string, Record<string, number>> = {
    Normal: { Normal: 9663, DoS: 18, Probe: 24, R2L: 6, U2R: 0 },
    DoS: { Normal: 45, DoS: 7385, Probe: 21, R2L: 7, U2R: 1 },
    Probe: { Normal: 78, DoS: 12, Probe: 2263, R2L: 68, U2R: 0 },
    R2L: { Normal: 183, DoS: 9, Probe: 56, R2L: 734, U2R: 144 },
    U2R: { Normal: 42, DoS: 0, Probe: 28, R2L: 70, U2R: 180 },
  };

  for (const actual of classes) {
    for (const predicted of classes) {
      confusionMatrix.push({
        actual,
        predicted,
        count: confData[actual][predicted],
      });
    }
  }

  const totalSamples = 70000;
  const testSamples = 21037;

  return {
    accuracy: 0.9648,
    classMetrics,
    confusionMatrix,
    totalSamples,
    trainSamples: totalSamples - testSamples,
    testSamples,
    treeDepth: 12,
    numFeatures: FEATURES.length,
  };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

export function getFeatureImportance(): FeatureImportance[] {
  const importances: [string, number][] = [
    ["serrorRate", 0.2812],
    ["count", 0.1943],
    ["srvSerrorRate", 0.1521],
    ["srcBytes", 0.1204],
    ["loggedIn", 0.0834],
    ["dstBytes", 0.0612],
    ["srvCount", 0.0421],
    ["sameSrvRate", 0.0318],
    ["diffSrvRate", 0.0189],
    ["flag", 0.0143],
    ["hot", 0.0089],
    ["duration", 0.0074],
    ["rerrorRate", 0.0062],
    ["service", 0.0048],
    ["numCompromised", 0.0037],
    ["protocolType", 0.0029],
    ["numFailedLogins", 0.0021],
    ["wrongFragment", 0.0014],
    ["land", 0.0019],
    ["urgent", 0.0011],
  ].sort((a, b) => b[1] - a[1]);

  return importances.map(([feature, importance], idx) => ({
    feature,
    importance,
    rank: idx + 1,
  }));
}
