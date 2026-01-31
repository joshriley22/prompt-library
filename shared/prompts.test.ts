import { describe, it, expect } from "vitest";
import { insertPromptSchema } from "./schema";

const basePrompt = {
  categoryId: 1,
  title: "Test Prompt",
  description: "A test description",
  content: "The prompt content here",
  isFavorite: false,
};

describe("insertPromptSchema (prompts with component_id)", () => {
  it("accepts a valid prompt with componentId", () => {
    const result = insertPromptSchema.safeParse({
      ...basePrompt,
      componentId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.componentId).toBe(1);
    }
  });

  it("accepts a valid prompt with componentId from any component", () => {
    const result = insertPromptSchema.safeParse({
      ...basePrompt,
      componentId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.componentId).toBe(42);
    }
  });

  it("accepts a prompt without componentId (optional)", () => {
    const result = insertPromptSchema.safeParse(basePrompt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.componentId).toBeUndefined();
    }
  });

  it("rejects componentId when it is not a number", () => {
    const result = insertPromptSchema.safeParse({
      ...basePrompt,
      componentId: "email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when required fields are missing", () => {
    expect(insertPromptSchema.safeParse({ ...basePrompt, title: undefined }).success).toBe(false);
    expect(insertPromptSchema.safeParse({ ...basePrompt, categoryId: undefined }).success).toBe(false);
    expect(insertPromptSchema.safeParse({ ...basePrompt, content: undefined }).success).toBe(false);
  });

  it("rejects invalid categoryId type", () => {
    const result = insertPromptSchema.safeParse({
      ...basePrompt,
      categoryId: "one",
    });
    expect(result.success).toBe(false);
  });
});
