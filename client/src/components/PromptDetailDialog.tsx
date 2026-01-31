import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Tag } from "lucide-react";
import { type PromptResponse } from "@shared/routes";
import { useCopyPrompt } from "@/hooks/use-prompts";

interface PromptDetailDialogProps {
  prompt: PromptResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptDetailDialog({ prompt, open, onOpenChange }: PromptDetailDialogProps) {
  const copyMutation = useCopyPrompt();

  if (!prompt) return null;

  const handleCopy = () => {
    copyMutation.mutate({ id: prompt.id, content: prompt.content });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 to-accent/5 p-6 pb-8 border-b">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 shadow-none">
                {prompt.category?.name}
              </Badge>
              {prompt.component?.name && (
                <Badge variant="outline" className="text-muted-foreground">
                  {prompt.component.name}
                </Badge>
              )}
              {prompt.isFavorite && (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                  Favorite
                </Badge>
              )}
            </div>
            <DialogTitle className="font-display text-2xl font-bold tracking-tight">
              {prompt.title}
            </DialogTitle>
            <DialogDescription className="text-base mt-2 text-muted-foreground">
              {prompt.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary" />
                The Prompt
              </h4>
              <div className="relative group rounded-xl border-2 border-muted bg-muted/30 p-4 transition-colors hover:border-primary/30">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
                  {prompt.content}
                </pre>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {prompt.metadata && (
              <div className="pt-4">
                 <h4 className="text-sm font-semibold text-muted-foreground mb-2">Usage Tips</h4>
                 <div className="text-sm text-muted-foreground bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                   Customize the bracketed sections like [Your Company Name] before sending.
                 </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 bg-muted/10 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleCopy} 
            className="min-w-[120px]"
            disabled={copyMutation.isPending}
          >
            {copyMutation.isSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
