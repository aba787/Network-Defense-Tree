import { Router, type IRouter } from "express";
import {
  ClassifyTrafficBody,
  ClassifyTrafficResponse,
  GetModelStatsResponse,
  GetTrafficLogResponse,
  GetFeatureImportanceResponse,
} from "@workspace/api-zod";
import { classify, getModelStats, getFeatureImportance } from "../lib/decisionTree.js";
import { appendLog, getLog } from "../lib/trafficLog.js";

const router: IRouter = Router();

router.get("/ids/model-stats", async (_req, res): Promise<void> => {
  const stats = getModelStats();
  res.json(GetModelStatsResponse.parse(stats));
});

router.post("/ids/classify", async (req, res): Promise<void> => {
  const parsed = ClassifyTrafficBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = classify(parsed.data);

  appendLog({
    label: result.label,
    confidence: result.confidence,
    isAttack: result.isAttack,
    attackType: result.attackType,
    srcBytes: parsed.data.srcBytes,
    dstBytes: parsed.data.dstBytes,
    duration: parsed.data.duration,
  });

  res.json(ClassifyTrafficResponse.parse(result));
});

router.get("/ids/traffic-log", async (_req, res): Promise<void> => {
  const entries = getLog(50);
  res.json(GetTrafficLogResponse.parse(entries));
});

router.get("/ids/feature-importance", async (_req, res): Promise<void> => {
  const features = getFeatureImportance();
  res.json(GetFeatureImportanceResponse.parse(features));
});

export default router;
