import { db } from "./db";
import {
  prompts,
  categories,
  components,
  type Prompt,
  type InsertPrompt,
  type Category,
  type InsertCategory,
  type Component,
  type PromptResponse,
  type CategoryResponse
} from "@shared/schema";
import { eq, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Components
  getComponents(): Promise<Component[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<CategoryResponse | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Prompts
  getPrompts(params?: { search?: string; categoryId?: number }): Promise<PromptResponse[]>;
  getPrompt(id: number): Promise<PromptResponse | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
}

export class DatabaseStorage implements IStorage {
  // Components
  async getComponents(): Promise<Component[]> {
    return await db.select().from(components);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<CategoryResponse | undefined> {
    const category = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (category.length === 0) return undefined;

    const categoryPrompts = await db.select().from(prompts).where(eq(prompts.categoryId, id));
    return { ...category[0], prompts: categoryPrompts };
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Prompts
  async getPrompts(params?: { search?: string; categoryId?: number }): Promise<PromptResponse[]> {
    let query = db.select({
      id: prompts.id,
      categoryId: prompts.categoryId,
      componentId: prompts.componentId,
      title: prompts.title,
      description: prompts.description,
      content: prompts.content,
      isFavorite: prompts.isFavorite,
      metadata: prompts.metadata,
      category: categories,
      component: components
    })
    .from(prompts)
    .leftJoin(categories, eq(prompts.categoryId, categories.id))
    .leftJoin(components, eq(prompts.componentId, components.id));

    if (params?.categoryId) {
      query.where(eq(prompts.categoryId, params.categoryId));
    }

    if (params?.search) {
      const searchLower = `%${params.search}%`;
      query.where(
        or(
          ilike(prompts.title, searchLower),
          ilike(prompts.description, searchLower),
          ilike(prompts.content, searchLower)
        )
      );
    }

    const results = await query;

    return results.map(row => ({
      ...row,
      category: row.category || undefined,
      component: row.component || undefined
    }));
  }

  async getPrompt(id: number): Promise<PromptResponse | undefined> {
    const result = await db.select({
      id: prompts.id,
      categoryId: prompts.categoryId,
      componentId: prompts.componentId,
      title: prompts.title,
      description: prompts.description,
      content: prompts.content,
      isFavorite: prompts.isFavorite,
      metadata: prompts.metadata,
      category: categories,
      component: components
    })
    .from(prompts)
    .leftJoin(categories, eq(prompts.categoryId, categories.id))
    .leftJoin(components, eq(prompts.componentId, components.id))
    .where(eq(prompts.id, id))
    .limit(1);
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      ...row,
      category: row.category || undefined,
      component: row.component || undefined
    };
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const values = { ...prompt, componentId: prompt.componentId || undefined };
    const [newPrompt] = await db.insert(prompts).values(values).returning();
    return newPrompt;
  }
}

export const storage = new DatabaseStorage();
