export interface TrafficLogEntry {
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

let nextId = 1;
const log: TrafficLogEntry[] = [];

const SEED_ENTRIES: Omit<TrafficLogEntry, "id" | "timestamp">[] = [
  { label: "Normal", confidence: 0.95, isAttack: false, attackType: null, srcBytes: 181, dstBytes: 5450, duration: 0 },
  { label: "Attack (DoS)", confidence: 0.96, isAttack: true, attackType: "DoS", srcBytes: 0, dstBytes: 0, duration: 0 },
  { label: "Normal", confidence: 0.92, isAttack: false, attackType: null, srcBytes: 239, dstBytes: 486, duration: 0 },
  { label: "Attack (Probe)", confidence: 0.85, isAttack: true, attackType: "Probe", srcBytes: 30, dstBytes: 0, duration: 1 },
  { label: "Normal", confidence: 0.98, isAttack: false, attackType: null, srcBytes: 521, dstBytes: 4321, duration: 0 },
  { label: "Attack (DoS)", confidence: 0.93, isAttack: true, attackType: "DoS", srcBytes: 0, dstBytes: 0, duration: 0 },
  { label: "Normal", confidence: 0.91, isAttack: false, attackType: null, srcBytes: 145, dstBytes: 2048, duration: 2 },
  { label: "Attack (R2L)", confidence: 0.78, isAttack: true, attackType: "R2L", srcBytes: 105, dstBytes: 146, duration: 11 },
];

function seedLog() {
  const now = Date.now();
  SEED_ENTRIES.forEach((entry, idx) => {
    const ts = new Date(now - (SEED_ENTRIES.length - idx) * 12000).toISOString();
    log.push({ id: nextId++, timestamp: ts, ...entry });
  });
}

seedLog();

export function appendLog(entry: Omit<TrafficLogEntry, "id" | "timestamp">): TrafficLogEntry {
  const newEntry: TrafficLogEntry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  log.unshift(newEntry);
  if (log.length > 200) log.pop();
  return newEntry;
}

export function getLog(limit = 50): TrafficLogEntry[] {
  return log.slice(0, limit);
}
