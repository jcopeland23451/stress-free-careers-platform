// Convenience re-exports so feature code has one import site for shared types.
export type { SessionUser } from "./auth";
export type {
  Role,
  Department,
  EmploymentType,
  PayType,
  JobStatus,
  ApplicationStage,
  ScreeningType,
  Level,
  StateCode,
} from "./constants";

// A screening question shape stored in JobTemplate.screening / used by the
// application form. Mirrors the ScreeningQuestion model's editable fields.
export type ScreeningQuestionInput = {
  prompt: string;
  type: string;
  options?: string[];
  required?: boolean;
  isKnockout?: boolean;
};
