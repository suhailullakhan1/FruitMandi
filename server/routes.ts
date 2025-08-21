import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMerchantSchema, insertWeightEntrySchema, insertBillSchema, insertBillItemSchema } from "@shared/schema";
import { z } from "zod";

// Session management
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
    name: string;
  };
}

// Middleware to check authentication
const requireAuth = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

// Middleware to check role
const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const session = await import("express-session");
  const memorystore = await import("memorystore");
  const MemoryStore = memorystore.default(session.default);

  app.use(session.default({
    secret: process.env.SESSION_SECRET || "fruit-trade-secret",
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication Routes
  app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
    try {
      const { phone, role } = req.body;

      if (!phone || !role) {
        return res.status(400).json({ message: "Phone and role are required" });
      }

      // For MVP, we'll use dummy OTP
      console.log(`OTP for ${phone}: 123456`);
      
      res.json({ 
        message: "OTP sent successfully",
        phone: phone
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { phone, otp, role, name } = req.body;

      if (!phone || !otp || !role) {
        return res.status(400).json({ message: "Phone, OTP, and role are required" });
      }

      // For MVP, accept dummy OTP
      if (otp !== "123456") {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Check if user exists
      let user = await storage.getUserByPhone(phone);
      
      if (!user) {
        // Create new user
        if (role === 'merchant' && !name) {
          return res.status(400).json({ message: "Name is required for new merchants" });
        }
        
        const userName = name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
        
        const newUser = insertUserSchema.parse({
          phone,
          role,
          name: userName,
          isActive: true
        });
        
        user = await storage.createUser(newUser);

        // If merchant role, create merchant profile
        if (role === 'merchant') {
          const merchantCode = `M${Date.now().toString().slice(-6)}`;
          const merchantData = {
            userId: user.id,
            merchantCode,
            name: userName,
            phone,
            isActive: true
          };
          await storage.createMerchant(merchantData);
        }
      }

      // Store user in session
      req.session.user = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name
      };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // Dashboard Routes
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Merchant Routes
  app.get("/api/merchants", requireAuth, async (req: Request, res: Response) => {
    try {
      const merchants = await storage.getMerchants();
      res.json(merchants);
    } catch (error) {
      console.error("Get merchants error:", error);
      res.status(500).json({ message: "Failed to fetch merchants" });
    }
  });

  app.post("/api/merchants", requireAuth, requireRole(['company']), async (req: Request, res: Response) => {
    try {
      const merchantData = insertMerchantSchema.parse(req.body);
      const merchant = await storage.createMerchant(merchantData);
      res.json(merchant);
    } catch (error) {
      console.error("Create merchant error:", error);
      res.status(500).json({ message: "Failed to create merchant" });
    }
  });

  // Fruit Routes
  app.get("/api/fruits", requireAuth, async (req: Request, res: Response) => {
    try {
      const fruits = await storage.getFruits();
      res.json(fruits);
    } catch (error) {
      console.error("Get fruits error:", error);
      res.status(500).json({ message: "Failed to fetch fruits" });
    }
  });

  app.patch("/api/fruits/:id/rate", requireAuth, requireRole(['company']), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rate } = req.body;

      if (!rate) {
        return res.status(400).json({ message: "Rate is required" });
      }

      const fruit = await storage.updateFruitRate(id, rate);
      
      if (!fruit) {
        return res.status(404).json({ message: "Fruit not found" });
      }

      res.json(fruit);
    } catch (error) {
      console.error("Update fruit rate error:", error);
      res.status(500).json({ message: "Failed to update fruit rate" });
    }
  });

  // Weight Entry Routes
  app.get("/api/weight-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getWeightEntries();
      res.json(entries);
    } catch (error) {
      console.error("Get weight entries error:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight-entries", requireAuth, requireRole(['writer', 'company']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { 
        merchantId, 
        fruitId, 
        entryType, 
        weight, 
        numberOfCrates, 
        averageWeightPerCrate, 
        rate, 
        totalAmount, 
        notes 
      } = req.body;

      // Validate required fields
      if (!merchantId || !fruitId || !weight || !rate || !totalAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate entry type specific fields
      if (entryType === 'multiple' && (!numberOfCrates || !averageWeightPerCrate)) {
        return res.status(400).json({ message: "Number of crates and average weight per crate are required for multiple entries" });
      }

      const weightEntryData = insertWeightEntrySchema.parse({
        merchantId,
        fruitId,
        entryType: entryType || 'single',
        weight,
        numberOfCrates: entryType === 'multiple' ? numberOfCrates : null,
        averageWeightPerCrate: entryType === 'multiple' ? averageWeightPerCrate : null,
        rate,
        totalAmount,
        notes,
        recordedBy: req.user!.id
      });

      const entry = await storage.createWeightEntry(weightEntryData);
      res.json({ 
        message: "Weight entry recorded successfully",
        entry 
      });
    } catch (error) {
      console.error("Create weight entry error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create weight entry" });
    }
  });

  // Bill Routes
  app.get("/api/bills", requireAuth, async (req: Request, res: Response) => {
    try {
      const bills = await storage.getBills();
      res.json(bills);
    } catch (error) {
      console.error("Get bills error:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBillById(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(bill);
    } catch (error) {
      console.error("Get bill error:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post("/api/bills", requireAuth, requireRole(['company']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { billData, items } = req.body;

      if (!billData || !items || !Array.isArray(items)) {
        return res.status(400).json({ message: "Bill data and items are required" });
      }

      // Generate bill number
      const billNumber = `BILL-${Date.now()}`;

      // Parse and validate bill data
      const billToCreate = {
        billNumber,
        merchantId: billData.merchantId,
        subtotal: billData.subtotal,
        transportDeduction: billData.transportDeduction || '0',
        commissionDeduction: billData.commissionDeduction || '0',
        otherDeduction: billData.otherDeduction || '0',
        netAmount: billData.netAmount,
        customMessage: billData.customMessage || null,
        status: billData.status || 'pending',
        dueDate: new Date(billData.dueDate),
        createdBy: req.user!.id
      };

      const parsedBillData = insertBillSchema.parse(billToCreate);
      const bill = await storage.createBill(parsedBillData);

      // Create bill items
      const parsedItems = items.map((item: any) => 
        insertBillItemSchema.parse({
          billId: bill.id,
          fruitId: item.fruitId,
          weight: item.weight,
          rate: item.rate,
          amount: item.amount
        })
      );

      await storage.createBillItems(parsedItems);

      res.json({ 
        message: "Bill created successfully",
        bill: { ...bill, items: parsedItems }
      });
    } catch (error) {
      console.error("Create bill error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create bill" });
    }
  });

  app.patch("/api/bills/:id/status", requireAuth, requireRole(['company']), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const bill = await storage.updateBillStatus(id, status);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(bill);
    } catch (error) {
      console.error("Update bill status error:", error);
      res.status(500).json({ message: "Failed to update bill status" });
    }
  });

  // Initialize default fruits if none exist
  try {
    // Skip fruit initialization until valid database is connected
    console.log('Skipping fruit initialization - database connection required');
  } catch (error) {
    console.log('Database not available yet - this is expected during development setup');
  }

  const httpServer = createServer(app);
  return httpServer;
}
