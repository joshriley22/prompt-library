import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Seed data from the original HTML file
async function seedDatabase() {
  const existingCategories = await storage.getCategories();
  if (existingCategories.length > 0) return;

  console.log("Seeding database with initial data...");

  const seedData = {
    emails: {
      title: "Email Management",
      icon: "Mail",
      color: "bg-blue-500",
      description: "Templates for professional communication",
      prompts: [
        {
          title: "Professional Client Follow-up",
          description: "Follow up with clients after meetings or proposals",
          content: "Write a professional follow-up email to a client after our meeting about [topic]. Include: a thank you for their time, key points discussed, next steps, and a clear call-to-action. Keep the tone friendly but professional."
        },
        {
          title: "Customer Service Response",
          description: "Respond to customer complaints or inquiries",
          content: "Draft a customer service email response to address [customer complaint/issue]. Show empathy, acknowledge the problem, explain the solution or next steps, and offer compensation if appropriate. Maintain a helpful and apologetic tone."
        },
        {
          title: "Sales Outreach Email",
          description: "Reach out to potential customers",
          content: "Create a cold outreach email to introduce our [product/service] to [target audience]. Highlight 3 key benefits, include a compelling subject line, keep it under 150 words, and end with a low-pressure call-to-action."
        },
        {
          title: "Meeting Request",
          description: "Schedule meetings with clients or partners",
          content: "Write an email requesting a meeting with [person/company] to discuss [topic]. Explain the purpose clearly, suggest 2-3 time slots, and keep it concise and respectful of their time."
        },
        {
          title: "Newsletter Template",
          description: "Create engaging customer newsletters",
          content: "Create a monthly newsletter for our [business type] customers. Include: a friendly greeting, 3 main updates/news items, a featured product/service, and a call-to-action. Make it conversational and engaging."
        }
      ]
    },
    finances: {
      title: "Financial Management",
      icon: "DollarSign",
      color: "bg-green-500",
      description: "Prompts for budgeting and financial analysis",
      prompts: [
        {
          title: "Budget Planning",
          description: "Create budgets for projects or periods",
          content: "Help me create a detailed budget for [project/time period]. My revenue/income is [amount], and I need to allocate funds across: [list categories like payroll, marketing, supplies, etc.]. Provide a breakdown with percentages and recommendations."
        },
        {
          title: "Expense Analysis",
          description: "Analyze and categorize business expenses",
          content: "Analyze these business expenses and categorize them: [paste expense list]. Identify areas where I might be overspending and suggest cost-cutting opportunities without compromising quality."
        },
        {
          title: "Invoice Creation",
          description: "Generate professional invoices",
          content: "Create a professional invoice for [client name] for [services/products provided]. Include: invoice number [#], date [date], itemized list of services/products, quantities, rates, subtotal, tax, and total. Add payment terms of [X days]."
        }
      ]
    },
    reports: {
      title: "Report Writing",
      icon: "FileText",
      color: "bg-purple-500",
      description: "Templates for business reports and summaries",
      prompts: [
        {
          title: "Monthly Performance Report",
          description: "Summarize monthly business performance",
          content: "Create a monthly performance report for [month]. Include sections on: sales/revenue, customer metrics, operational highlights, challenges faced, and goals for next month. Here's the data: [paste your data]."
        },
        {
          title: "Project Status Update",
          description: "Update stakeholders on project progress",
          content: "Write a project status report for [project name]. Cover: current progress (%), completed milestones, upcoming tasks, budget status, risks/issues, and next steps. Keep it concise and actionable."
        }
      ]
    },
    scheduling: {
      title: "Scheduling & Planning",
      icon: "Calendar",
      color: "bg-orange-500",
      description: "Tools for time management and planning",
      prompts: [
        {
          title: "Weekly Team Schedule",
          description: "Organize team schedules and shifts",
          content: "Create a weekly schedule for our team of [number] people covering [hours/days]. Roles needed: [list roles]. Constraints: [any limitations like availability, max hours]. Ensure fair distribution and adequate coverage."
        },
        {
          title: "Project Timeline",
          description: "Plan project timelines and milestones",
          content: "Create a project timeline for [project name] that needs to be completed by [deadline]. Break down into phases, assign realistic timeframes, identify dependencies, and highlight critical milestones. Total duration: [X weeks/months]."
        },
        {
          title: "Meeting Agenda",
          description: "Structure productive meeting agendas",
          content: "Create a meeting agenda for [meeting purpose] scheduled for [duration]. Topics to cover: [list topics]. Include time allocations for each item, expected outcomes, and any pre-work needed from attendees."
        }
      ]
    },
    marketing: {
      title: "Marketing & Sales",
      icon: "Megaphone",
      color: "bg-pink-500",
      description: "Prompts for marketing campaigns and content",
      prompts: [
        {
          title: "Social Media Post",
          description: "Create engaging social media content",
          content: "Write a [platform] post about [topic/product/announcement]. Target audience: [describe audience]. Goal: [engagement/sales/awareness]. Include a hook, value proposition, and call-to-action. Add relevant hashtag suggestions."
        },
        {
          title: "Product Description",
          description: "Write compelling product descriptions",
          content: "Write a product description for [product name]. Key features: [list features]. Target customer: [describe]. Benefits: [list benefits]. Make it persuasive, highlight what makes it unique, and optimize for both customers and SEO."
        },
        {
          title: "Marketing Campaign Ideas",
          description: "Brainstorm marketing campaign concepts",
          content: "Generate 5 marketing campaign ideas for [product/service/event]. Target audience: [describe]. Budget: [amount/range]. Goals: [awareness/sales/engagement]. Include campaign themes, channels, and expected outcomes."
        }
      ]
    },
    operations: {
      title: "Business Operations",
      icon: "Settings",
      color: "bg-gray-500",
      description: "Daily management and operations prompts",
      prompts: [
        {
          title: "Standard Operating Procedure (SOP)",
          description: "Create clear procedures for team tasks",
          content: "Write a detailed Standard Operating Procedure for [task name]. Include: purpose, equipment needed, step-by-step instructions, safety precautions, and troubleshooting tips."
        },
        {
          title: "Inventory Management Strategy",
          description: "Optimize stock levels and ordering",
          content: "Develop an inventory management plan for [business type]. Focus on reducing waste, optimizing reorder points for [key products], and managing lead times from [suppliers]."
        }
      ]
    },
    hr: {
      title: "HR & Team Management",
      icon: "Users",
      color: "bg-indigo-500",
      description: "Resources for human resources and team building",
      prompts: [
        {
          title: "Job Posting",
          description: "Create attractive job postings",
          content: "Write a job posting for a [job title] role at our [company description]. Responsibilities: [list key duties]. Qualifications: [list requirements]. Highlight our company culture and benefits to attract top talent."
        },
        {
          title: "Employee Feedback",
          description: "Structure constructive feedback",
          content: "Draft constructive feedback for an employee regarding [issue/performance area]. Use the Situation-Behavior-Impact (SBI) model. Be specific, supportive, and focus on improvement and professional growth."
        }
      ]
    }
  };

  for (const [slug, data] of Object.entries(seedData)) {
    const category = await storage.createCategory({
      name: data.title,
      slug: slug,
      description: data.description,
      icon: data.icon,
      color: data.color
    });

    for (const prompt of data.prompts) {
      await storage.createPrompt({
        categoryId: category.id,
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        isFavorite: false
      });
    }
  }
  
  console.log("Seeding complete!");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed data on startup
  seedDatabase().catch(console.error);

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const category = await storage.getCategory(Number(req.params.id));
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  });

  // Prompts
  app.get(api.prompts.list.path, async (req, res) => {
    try {
      // Manual query param parsing since express doesn't auto-convert types
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      
      const prompts = await storage.getPrompts({ search, categoryId });
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.prompts.get.path, async (req, res) => {
    const prompt = await storage.getPrompt(Number(req.params.id));
    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    res.json(prompt);
  });

  app.post(api.prompts.create.path, async (req, res) => {
    try {
      const input = api.prompts.create.input.parse(req.body);
      const prompt = await storage.createPrompt(input);
      res.status(201).json(prompt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.prompts.copy.path, async (req, res) => {
    // Just a placeholder endpoint to track stats if we wanted to
    // For now it just returns success
    res.json({ success: true });
  });

  return httpServer;
}
