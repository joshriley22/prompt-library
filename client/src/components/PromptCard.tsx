import { motion } from "framer-motion";
import { Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useCopyPrompt } from "@/hooks/use-prompts";
import { type PromptResponse } from "@shared/routes";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: PromptResponse;
  onClick?: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const copyMutation = useCopyPrompt();
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyMutation.mutate({ id: prompt.id, content: prompt.content });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full flex flex-col group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden bg-card"
        onClick={onClick}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="secondary" className={cn(
                  "font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent",
                )}>
                  {prompt.category?.name || "Uncategorized"}
                </Badge>
                {prompt.component?.name && (
                  <Badge variant="outline" className="font-medium text-muted-foreground">
                    {prompt.component.name}
                  </Badge>
                )}
              </div>
              <h3 className="font-display font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow px-6 pb-2">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {prompt.description}
          </p>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="font-mono text-xs text-muted-foreground line-clamp-2 italic">
              "{prompt.content}"
            </p>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 pt-2 flex justify-between items-center border-t border-border/40 mt-auto bg-muted/10">
           <div className="flex items-center text-xs text-muted-foreground font-medium">
             <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
             AI Prompt
           </div>

           <Button 
             size="sm" 
             variant={copyMutation.isPending || copyMutation.isSuccess ? "secondary" : "default"}
             className={cn(
               "h-8 px-4 transition-all duration-300", 
               copyMutation.isSuccess && "bg-green-100 text-green-700 hover:bg-green-200"
             )}
             onClick={handleCopy}
             disabled={copyMutation.isPending}
           >
             {copyMutation.isSuccess ? (
               <>
                 <Check className="w-3.5 h-3.5 mr-1.5" />
                 Copied
               </>
             ) : (
               <>
                 <Copy className="w-3.5 h-3.5 mr-1.5" />
                 Copy
               </>
             )}
           </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
