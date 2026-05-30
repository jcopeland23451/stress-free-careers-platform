// Allowed values for the String-typed enum fields (SQLite has no native enums).
// These are the single source of truth used by validation, seed, and UI.

export const ROLES = ["CORPORATE", "REGIONAL", "DISTRICT", "GM"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  CORPORATE: "Corporate / HR",
  REGIONAL: "Regional Manager",
  DISTRICT: "District Manager",
  GM: "General Manager",
};

export const DEPARTMENTS = [
  "Repair & Maintenance",
  "Sales & Service",
  "Store Management",
  "Customer Support",
  "People Operations",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
};

export const PAY_TYPES = ["HOURLY", "SALARY"] as const;
export type PayType = (typeof PAY_TYPES)[number];

export const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];
export const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};
// Columns shown in the pipeline kanban (terminal stages handled separately).
export const PIPELINE_STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export const SCREENING_TYPES = [
  "text",
  "boolean",
  "select",
  "multiselect",
  "number",
  "cert",
] as const;
export type ScreeningType = (typeof SCREENING_TYPES)[number];

export const LEVELS = ["A", "B"] as const;
export type Level = (typeof LEVELS)[number];

export const US_STATES = { CA: "California", TX: "Texas" } as const;
export type StateCode = keyof typeof US_STATES;

// Metro hubs with approximate centroids for "jobs near me" radius filtering.
export const METROS = [
  { id: "bay-area", label: "Bay Area", state: "CA", lat: 37.7749, lng: -122.4194 },
  { id: "los-angeles", label: "Los Angeles", state: "CA", lat: 34.0522, lng: -118.2437 },
  { id: "san-diego", label: "San Diego", state: "CA", lat: 32.7157, lng: -117.1611 },
  { id: "sacramento", label: "Sacramento", state: "CA", lat: 38.5816, lng: -121.4944 },
  { id: "dfw", label: "Dallas–Fort Worth", state: "TX", lat: 32.7767, lng: -96.797 },
] as const;

// ASE certifications (options for "cert" screening questions).
export const ASE_CERTS = [
  "A1 Engine Repair",
  "A4 Suspension & Steering",
  "A5 Brakes",
  "A6 Electrical / Electronic Systems",
  "A7 Heating & Air Conditioning",
  "A8 Engine Performance",
  "G1 Maintenance & Light Repair",
  "ASE Master Technician",
  "None yet — in progress",
] as const;

// EEO / OFCCP voluntary self-identification option sets (standard language).
export const EEO_GENDER = ["Male", "Female", "I prefer not to say"] as const;
export const EEO_RACE = [
  "Hispanic or Latino",
  "White (Not Hispanic or Latino)",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "Asian",
  "American Indian or Alaska Native",
  "Two or More Races",
  "I prefer not to say",
] as const;
export const EEO_VETERAN = [
  "I am not a protected veteran",
  "I identify as one or more classifications of protected veteran",
  "I prefer not to say",
] as const;
export const EEO_DISABILITY = [
  "Yes, I have a disability (or previously had one)",
  "No, I do not have a disability",
  "I prefer not to answer",
] as const;

export const COMPANY = {
  name: "Stress-Free Auto Care",
  tagline: "Auto care without the stress.",
  eoeStatement:
    "Stress-Free Auto Care is an Equal Opportunity Employer. All qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or protected veteran status.",
};
