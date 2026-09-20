import { describe, expect, it } from "vitest";

import {
  loginSchema,
  passwordChecklist,
  registerSchema,
} from "@/lib/validation/auth";

describe("registerSchema", () => {
  const valid = {
    displayName: "Ana Silva",
    email: "ana@example.com",
    password: "Passw0rd",
    confirmPassword: "Passw0rd",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases and trims the email", () => {
    const result = registerSchema.safeParse({
      ...valid,
      email: "  Ana@Example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("ana@example.com");
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a password missing a number", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "NoNumberHere",
      confirmPassword: "NoNumberHere",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name that is too short", () => {
    const result = registerSchema.safeParse({ ...valid, displayName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts email and any non-empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("passwordChecklist", () => {
  it("reports every rule as unmet for an empty string", () => {
    const checklist = passwordChecklist("");
    expect(checklist.every((rule) => !rule.met)).toBe(true);
  });

  it("reports every rule as met for a strong password", () => {
    const checklist = passwordChecklist("Passw0rd123");
    expect(checklist.every((rule) => rule.met)).toBe(true);
  });

  it("flags only the missing rules for a partial password", () => {
    const checklist = passwordChecklist("password1");
    const byLabel = Object.fromEntries(
      checklist.map((rule) => [rule.label, rule.met]),
    );
    expect(byLabel["One lowercase letter"]).toBe(true);
    expect(byLabel["One number"]).toBe(true);
    expect(byLabel["One uppercase letter"]).toBe(false);
  });
});
