import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPromptSchema } from "@shared/schema";
import { type InsertPrompt } from "@shared/routes";
import { useCreatePrompt, useCategories, useComponents } from "@/hooks/use-prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddPromptDialog() {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const { data: componentsList } = useComponents();
  const createMutation = useCreatePrompt();

  const form = useForm<InsertPrompt>({
    resolver: zodResolver(insertPromptSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      isFavorite: false,
      componentId: 0,
    },
  });

  useEffect(() => {
    if (componentsList?.length && form.getValues("componentId") === 0) {
      form.setValue("componentId", componentsList[0].id);
    }
  }, [componentsList, form]);

  const onSubmit = (data: InsertPrompt) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Create Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Prompt</DialogTitle>
          <DialogDescription>
            Add a new AI prompt to the library to share with your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="componentId"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Component</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select component" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {componentsList?.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id.toString()}>
                            {comp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Briefly describe what this prompt does..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="min-h-[150px] font-mono text-sm"
                      placeholder="Enter the full AI prompt here..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Prompt"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
