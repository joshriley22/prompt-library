import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // FontAwesome class or Lucide icon name
  color: text("color").notNull(), // Tailwind color class
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  metadata: text("metadata"), // JSON string for extra tags or data
});

// === RELATIONS ===

export const categoriesRelations = relations(categories, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertPromptSchema = createInsertSchema(prompts).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

// Request types
export type CreatePromptRequest = InsertPrompt;
export type UpdatePromptRequest = Partial<InsertPrompt>;

// Response types
export type PromptResponse = Prompt & { category?: Category };
export type CategoryResponse = Category & { prompts?: Prompt[] };
export type PromptsListResponse = PromptResponse[];

// Query types
export interface PromptsQueryParams {
  search?: string;
  categoryId?: number;
}
