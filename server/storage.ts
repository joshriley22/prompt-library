import { db } from "./db";
import {
  prompts,
  categories,
  type Prompt,
  type InsertPrompt,
  type Category,
  type InsertCategory,
  type PromptResponse,
  type CategoryResponse
} from "@shared/schema";
import { eq, like, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<CategoryResponse | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Prompts
  getPrompts(params?: { search?: string; categoryId?: number }): Promise<PromptResponse[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
}

export class DatabaseStorage implements IStorage {
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
      title: prompts.title,
      description: prompts.description,
      content: prompts.content,
      isFavorite: prompts.isFavorite,
      metadata: prompts.metadata,
      category: categories
    })
    .from(prompts)
    .leftJoin(categories, eq(prompts.categoryId, categories.id));

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
    
    // Transform result to match PromptResponse type (handling the join)
    return results.map(row => ({
      ...row,
      // Ensure category is present (it should be due to not null constraint, but left join type implies null)
      category: row.category || undefined
    }));
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }
}

export const storage = new DatabaseStorage();
