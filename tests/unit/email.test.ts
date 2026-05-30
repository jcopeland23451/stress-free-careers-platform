import { describe, it, expect } from "vitest";
import { applicationReceivedEmail, stageChangeEmail } from "@/lib/email";

// NOTE: sendEmail is intentionally not tested — it writes to the DB.

describe("applicationReceivedEmail", () => {
  const result = applicationReceivedEmail("Alice", "Auto Technician");

  it("includes jobTitle in the subject", () => {
    expect(result.subject).toContain("Auto Technician");
  });

  it("includes the candidate name in the body", () => {
    expect(result.body).toContain("Alice");
  });

  it("returns an object with subject and body", () => {
    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("body");
  });

  it("subject mentions receipt of the application", () => {
    // Contains "received" or similar language indicating confirmation
    expect(result.subject.toLowerCase()).toContain("received");
  });

  it("body mentions the job title", () => {
    expect(result.body).toContain("Auto Technician");
  });
});

describe("stageChangeEmail — subject", () => {
  it("always includes jobTitle in the subject", () => {
    for (const stage of ["SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"]) {
      const { subject } = stageChangeEmail("Bob", "Service Advisor", stage);
      expect(subject).toContain("Service Advisor");
    }
  });

  it("includes the candidate name in the body for all stages", () => {
    for (const stage of ["SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"]) {
      const { body } = stageChangeEmail("Carlos", "Sales Associate", stage);
      expect(body).toContain("Carlos");
    }
  });
});

describe("stageChangeEmail — stage-specific body content", () => {
  it("INTERVIEW body mentions interview", () => {
    const { body } = stageChangeEmail("Dana", "Technician", "INTERVIEW");
    expect(body.toLowerCase()).toContain("interview");
  });

  it("REJECTED body mentions moving forward with other candidates", () => {
    const { body } = stageChangeEmail("Eve", "Technician", "REJECTED");
    expect(body.toLowerCase()).toMatch(/other candidate|move forward/);
  });

  it("HIRED body welcomes the candidate to the team", () => {
    const { body } = stageChangeEmail("Frank", "Technician", "HIRED");
    expect(body.toLowerCase()).toContain("welcome");
  });

  it("OFFER body mentions offer or preparing", () => {
    const { body } = stageChangeEmail("Grace", "Technician", "OFFER");
    expect(body.toLowerCase()).toContain("offer");
  });

  it("SCREENING body differs from INTERVIEW body", () => {
    const screening = stageChangeEmail("Hank", "Tech", "SCREENING").body;
    const interview = stageChangeEmail("Hank", "Tech", "INTERVIEW").body;
    expect(screening).not.toBe(interview);
  });

  it("REJECTED body differs from HIRED body", () => {
    const rejected = stageChangeEmail("Ivy", "Tech", "REJECTED").body;
    const hired = stageChangeEmail("Ivy", "Tech", "HIRED").body;
    expect(rejected).not.toBe(hired);
  });

  it("unknown stage falls back to a generic message containing the stage name", () => {
    const { body } = stageChangeEmail("Jay", "Tech", "PENDING_REVIEW");
    expect(body).toContain("PENDING_REVIEW");
  });

  it("WITHDRAWN body mentions application has been withdrawn", () => {
    const { body } = stageChangeEmail("Kai", "Technician", "WITHDRAWN");
    expect(body.toLowerCase()).toContain("withdrawn");
  });
});
