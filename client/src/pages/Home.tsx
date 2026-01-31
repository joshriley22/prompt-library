import { useState } from "react";
import { usePrompts, useCategories } from "@/hooks/use-prompts";
import { CategorySidebar } from "@/components/CategorySidebar";
import { PromptCard } from "@/components/PromptCard";
import { PromptDetailDialog } from "@/components/PromptDetailDialog";
import { AddPromptDialog } from "@/components/AddPromptDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { type PromptResponse } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Debounced search could be implemented here, but simple state works for now
  const { data: prompts, isLoading, isError } = usePrompts({ 
    search: search || undefined, 
    categoryId 
  });

  const { data: categories } = useCategories();
  
  const currentCategory = categories?.find(c => c.id === categoryId);

  const handlePromptClick = (prompt: PromptResponse) => {
    setSelectedPrompt(prompt);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shadow-xl z-10">
        <CategorySidebar 
          selectedCategoryId={categoryId} 
          onSelectCategory={setCategoryId} 
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                 <CategorySidebar 
                   selectedCategoryId={categoryId} 
                   onSelectCategory={(id) => {
                     setCategoryId(id);
                     // Close sheet hack (optional if controlled)
                   }} 
                 />
              </SheetContent>
            </Sheet>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AddPromptDialog />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
           {/* Background decorative elements */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

           <div className="relative z-0 max-w-7xl mx-auto">
             <div className="mb-8">
               <h1 className="text-3xl font-display font-bold text-foreground">
                 {currentCategory ? currentCategory.name : "All Prompts"}
               </h1>
               <p className="text-muted-foreground mt-2">
                 {currentCategory 
                   ? currentCategory.description 
                   : "Browse our collection of business-ready AI prompts to supercharge your workflow."}
               </p>
             </div>

             {isLoading ? (
               <div className="flex justify-center items-center h-64">
                 <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
               </div>
             ) : isError ? (
               <div className="flex flex-col justify-center items-center h-64 text-center">
                 <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
                 <h3 className="text-lg font-semibold">Failed to load prompts</h3>
                 <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
               </div>
             ) : prompts?.length === 0 ? (
               <div className="flex flex-col justify-center items-center h-64 text-center bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20 p-8">
                 <div className="bg-primary/10 p-4 rounded-full mb-4">
                   <Search className="w-8 h-8 text-primary" />
                 </div>
                 <h3 className="text-lg font-semibold">No prompts found</h3>
                 <p className="text-muted-foreground max-w-sm mt-2">
                   We couldn't find any prompts matching your search. Try adjusting your filters or create a new one.
                 </p>
                 <div className="mt-6">
                   <AddPromptDialog />
                 </div>
               </div>
             ) : (
               <motion.div 
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                 layout
               >
                 <AnimatePresence>
                   {prompts?.map((prompt) => (
                     <PromptCard 
                       key={prompt.id} 
                       prompt={prompt} 
                       onClick={() => handlePromptClick(prompt)}
                     />
                   ))}
                 </AnimatePresence>
               </motion.div>
             )}
           </div>
        </div>
      </div>

      <PromptDetailDialog 
        prompt={selectedPrompt} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
}
