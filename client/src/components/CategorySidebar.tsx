import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories } from "@/hooks/use-prompts";
import { 
  LayoutGrid, 
  Mail, 
  DollarSign, 
  Users, 
  Megaphone, 
  Briefcase, 
  Calendar,
  PenTool,
  Search
} from "lucide-react";

interface CategorySidebarProps {
  selectedCategoryId: number | undefined;
  onSelectCategory: (id: number | undefined) => void;
  className?: string;
}

// Helper to map icon strings to Lucide components
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Mail, DollarSign, Users, Megaphone, Briefcase, Calendar, PenTool, Search
  };
  return icons[iconName] || LayoutGrid;
};

export function CategorySidebar({ selectedCategoryId, onSelectCategory, className }: CategorySidebarProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className={cn("w-64 border-r bg-card p-4 space-y-4", className)}>
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full md:w-64 flex flex-col border-r bg-card h-full", className)}>
      <div className="p-6 pb-2">
        <h2 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Prompt Library
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Smart tools for business owners
        </p>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <Button
            variant={selectedCategoryId === undefined ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start font-medium",
              selectedCategoryId === undefined && "bg-primary/10 text-primary hover:bg-primary/15"
            )}
            onClick={() => onSelectCategory(undefined)}
          >
            <LayoutGrid className="mr-3 h-4 w-4" />
            All Prompts
          </Button>

          <div className="py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </h3>
            {categories?.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium mb-1",
                    selectedCategoryId === category.id && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                  onClick={() => onSelectCategory(category.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20">
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <h4 className="font-semibold text-sm mb-1">Need Help?</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Can't find the prompt you need? Let us create it for you.
          </p>
          <Button size="sm" className="w-full text-xs h-8">
            Request Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
