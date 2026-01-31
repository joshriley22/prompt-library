import { z } from 'zod';
import { insertPromptSchema, insertCategorySchema, prompts, categories, components } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  components: {
    list: {
      method: 'GET' as const,
      path: '/api/components',
      responses: {
        200: z.array(z.custom<typeof components.$inferSelect>()),
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/categories/:id',
      responses: {
        200: z.custom<typeof categories.$inferSelect & { prompts: typeof prompts.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    }
  },
  prompts: {
    list: {
      method: 'GET' as const,
      path: '/api/prompts',
      input: z.object({
        search: z.string().optional(),
        categoryId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof prompts.$inferSelect & { category?: typeof categories.$inferSelect; component?: typeof components.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/prompts/:id',
      responses: {
        200: z.custom<typeof prompts.$inferSelect & { category?: typeof categories.$inferSelect; component?: typeof components.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/prompts',
      input: insertPromptSchema,
      responses: {
        201: z.custom<typeof prompts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    copy: {
      method: 'POST' as const,
      path: '/api/prompts/:id/copy', // Track copy stats if needed
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type PromptInput = z.infer<typeof api.prompts.create.input>;
export type PromptResponse = z.infer<typeof api.prompts.list.responses[200]>[number];
