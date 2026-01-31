import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";
import { registerRoutes } from "./routes";
import type { IStorage } from "./storage";
import type { Category, Component, Prompt, PromptResponse } from "@shared/schema";
import { api } from "@shared/routes";

/**
 * In-memory storage for testing prompts with component_id.
 * Optionally pass initial components so GET responses can include component details.
 */
function createInMemoryStorage(initialComponents: Component[] = []): IStorage {
  const categories: Category[] = [];
  const components: Component[] = [...initialComponents];
  const prompts: Prompt[] = [];

  return {
    async getComponents() {
      return [...components];
    },
    async getCategories() {
      return [...categories];
    },
    async getCategory(id: number) {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return undefined;
      const categoryPrompts = prompts.filter((p) => p.categoryId === id);
      return { ...cat, prompts: categoryPrompts };
    },
    async getCategoryBySlug(slug: string) {
      return categories.find((c) => c.slug === slug);
    },
    async createCategory(category: Omit<Category, "id">) {
      const id = categories.length + 1;
      const newCat = { ...category, id } as Category;
      categories.push(newCat);
      return newCat;
    },
    async getPrompts(params?: { search?: string; categoryId?: number }) {
      let list = prompts;
      if (params?.categoryId) {
        list = list.filter((p) => p.categoryId === params.categoryId);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
        );
      }
      return list.map((p) => {
        const category = categories.find((c) => c.id === p.categoryId);
        const component = p.componentId
          ? components.find((c) => c.id === p.componentId)
          : undefined;
        return { ...p, category, component } as PromptResponse;
      });
    },
    async getPrompt(id: number) {
      const prompt = prompts.find((p) => p.id === id);
      if (!prompt) return undefined;
      const category = categories.find((c) => c.id === prompt.categoryId);
      const component = prompt.componentId
        ? components.find((c) => c.id === prompt.componentId)
        : undefined;
      return { ...prompt, category, component } as PromptResponse;
    },
    async createPrompt(input: {
      categoryId: number;
      componentId?: number;
      title: string;
      description: string;
      content: string;
      isFavorite?: boolean;
      metadata?: string | null;
    }) {
      const id = prompts.length + 1;
      const componentId = input.componentId || undefined;
      const newPrompt = {
        id,
        categoryId: input.categoryId,
        componentId: componentId ?? null,
        title: input.title,
        description: input.description,
        content: input.content,
        isFavorite: input.isFavorite ?? false,
        metadata: input.metadata ?? null,
      } as Prompt;
      prompts.push(newPrompt);
      return newPrompt;
    },
  };
}

describe("POST /api/prompts with component_id", () => {
  let app: express.Express;
  let store: IStorage;
  let category: Category;
  let component1: Component;
  let component2: Component;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    component1 = { id: 1, name: "Email" };
    component2 = { id: 2, name: "Document" };
    store = createInMemoryStorage([component1, component2]);

    category = await store.createCategory({
      name: "Test Category",
      slug: "test",
      description: "For tests",
      icon: "Test",
      color: "bg-gray-500",
    });

    const httpServer = createServer(app);
    await registerRoutes(httpServer, app, store);
  });

  it("creates a prompt with component_id and returns it", async () => {
    const res = await request(app)
      .post(api.prompts.create.path)
      .send({
        categoryId: category.id,
        componentId: component1.id,
        title: "Email Prompt",
        description: "For sending emails",
        content: "Write an email about [topic]",
        isFavorite: false,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      title: "Email Prompt",
      categoryId: category.id,
      componentId: component1.id,
      content: "Write an email about [topic]",
    });
    expect(res.body.id).toBeDefined();
  });

  it("returns the prompt with component when GET /api/prompts/:id", async () => {
    const createRes = await request(app)
      .post(api.prompts.create.path)
      .send({
        categoryId: category.id,
        componentId: component2.id,
        title: "Document Prompt",
        description: "For documents",
        content: "Write a document",
        isFavorite: false,
      })
      .expect(201);

    const promptId = createRes.body.id;
    const getRes = await request(app)
      .get(api.prompts.get.path.replace(":id", String(promptId)))
      .expect(200);

    expect(getRes.body).toMatchObject({
      id: promptId,
      title: "Document Prompt",
      componentId: component2.id,
    });
    expect(getRes.body.component).toMatchObject({ id: component2.id, name: component2.name });
  });

  it("lists prompts with component in GET /api/prompts", async () => {
    const listRes = await request(app).get(api.prompts.list.path).expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    const withComponent = listRes.body.find((p: any) => p.component?.name === "Document");
    expect(withComponent).toBeDefined();
    expect(withComponent.component).toMatchObject({ id: 2, name: "Document" });
  });

  it("creates a prompt without component_id (optional)", async () => {
    const res = await request(app)
      .post(api.prompts.create.path)
      .send({
        categoryId: category.id,
        title: "No Component Prompt",
        description: "No component",
        content: "Content without component",
        isFavorite: false,
      })
      .expect(201);

    expect(res.body.title).toBe("No Component Prompt");
    expect(res.body.componentId).toBeFalsy();
  });

  it("rejects invalid component_id type with 400", async () => {
    const res = await request(app)
      .post(api.prompts.create.path)
      .send({
        categoryId: category.id,
        componentId: "not-a-number",
        title: "Bad",
        description: "Bad",
        content: "Bad",
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
