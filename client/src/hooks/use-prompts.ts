import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PromptInput, type PromptResponse, type Category } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// PROMPTS HOOKS
// ============================================

export function usePrompts(filters?: { search?: string; categoryId?: number }) {
  const queryKey = [api.prompts.list.path, filters?.search, filters?.categoryId].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query params
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.categoryId) params.categoryId = filters.categoryId.toString();
      
      const queryString = new URLSearchParams(params).toString();
      const url = `${api.prompts.list.path}${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prompts");
      
      const data = await res.json();
      return api.prompts.list.responses[200].parse(data);
    },
  });
}

export function usePrompt(id: number) {
  return useQuery({
    queryKey: [api.prompts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.prompts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch prompt");
      
      const data = await res.json();
      return api.prompts.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PromptInput) => {
      const res = await fetch(api.prompts.create.path, {
        method: api.prompts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.prompts.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create prompt");
      }
      
      return api.prompts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.prompts.list.path] });
      toast({
        title: "Success",
        description: "Prompt created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useCopyPrompt() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      // Optimistically copy to clipboard
      await navigator.clipboard.writeText(content);
      
      // Notify backend for analytics (optional, as defined in routes)
      const url = buildUrl(api.prompts.copy.path, { id });
      await fetch(url, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard ready for use.",
      });
    },
    onError: () => {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try manually.",
        variant: "destructive",
      });
    }
  });
}

// ============================================
// COMPONENTS HOOKS
// ============================================

export function useComponents() {
  return useQuery({
    queryKey: [api.components.list.path],
    queryFn: async () => {
      const res = await fetch(api.components.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch components");
      const data = await res.json();
      return api.components.list.responses[200].parse(data);
    },
  });
}

// ============================================
// CATEGORIES HOOKS
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      
      const data = await res.json();
      return api.categories.list.responses[200].parse(data);
    },
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: [api.categories.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.categories.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch category");
      
      const data = await res.json();
      return api.categories.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}
