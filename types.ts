
export enum DiseaseType {
  HEALTHY = "Healthy",
  APPLE_SCAB = "Apple Scab",
  BLACK_ROT = "Black Rot",
  CEDAR_APPLE_RUST = "Cedar Apple Rust"
}

export enum SeverityLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  NONE = "None"
}

export interface AnalysisResult {
  disease: DiseaseType;
  severity: SeverityLevel;
  confidence: number;
  description: string;
  recommendation: string;
  timestamp: string;
}

export interface ModelMetrics {
  accuracy: number;
  f1Score: number;
  mAP: number;
  inferenceTime: string;
  fps: number;
}
