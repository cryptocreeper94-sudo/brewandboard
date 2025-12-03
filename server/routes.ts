import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCrmNoteSchema, 
  insertClientSchema, 
  insertCrmActivitySchema, 
  insertCrmMeetingSchema,
  insertScheduledOrderSchema,
  insertOrderEventSchema,
  MINIMUM_ORDER_LEAD_TIME_HOURS
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ========================
  // AUTH ROUTES
  // ========================
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Check if PIN already exists
      if (validatedData.pin) {
        const existingPin = await storage.getUserByPin(validatedData.pin);
        if (existingPin) {
          return res.status(400).json({ error: "PIN already in use" });
        }
      }
      
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        return res.status(400).json({ error: "PIN required" });
      }
      
      const user = await storage.getUserByPin(pin);
      if (!user) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // PORTFOLIO NOTES ROUTES
  // ========================
  
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const notes = await storage.getNotes(userId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertCrmNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // CLIENTS ROUTES
  // ========================
  
  app.get("/api/clients", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // ACTIVITIES ROUTES
  // ========================
  
  app.get("/api/activities", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId as string | undefined;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const activities = await storage.getActivities(userId, entityType, entityId);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertCrmActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========================
  // MEETINGS ROUTES
  // ========================
  
  app.get("/api/meetings", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const meetings = await storage.getMeetings(userId);
      res.json(meetings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertCrmMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(validatedData);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.updateMeeting(req.params.id, req.body);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      await storage.deleteMeeting(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // SCHEDULED ORDERS ROUTES
  // ========================
  
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const orders = await storage.getScheduledOrders(userId, startDate, endDate);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getScheduledOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertScheduledOrderSchema.parse(req.body);
      
      // Validate minimum lead time (2 hours)
      const scheduledDateTime = new Date(`${validatedData.scheduledDate}T${validatedData.scheduledTime}`);
      const now = new Date();
      const hoursUntilDelivery = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDelivery < MINIMUM_ORDER_LEAD_TIME_HOURS) {
        return res.status(400).json({ 
          error: `Orders must be placed at least ${MINIMUM_ORDER_LEAD_TIME_HOURS} hours before delivery time to guarantee on-time delivery.` 
        });
      }
      
      const order = await storage.createScheduledOrder(validatedData);
      
      // Create initial order event
      await storage.createOrderEvent({
        orderId: order.id,
        status: 'scheduled',
        note: 'Order placed',
        changedBy: 'system'
      });
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      // Verify order exists and belongs to user
      const existingOrder = await storage.getScheduledOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // If updating schedule, validate lead time
      if (req.body.scheduledDate || req.body.scheduledTime) {
        const newDate = req.body.scheduledDate || existingOrder.scheduledDate;
        const newTime = req.body.scheduledTime || existingOrder.scheduledTime;
        const scheduledDateTime = new Date(`${newDate}T${newTime}`);
        const now = new Date();
        const hoursUntilDelivery = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilDelivery < MINIMUM_ORDER_LEAD_TIME_HOURS) {
          return res.status(400).json({ 
            error: `Orders must be scheduled at least ${MINIMUM_ORDER_LEAD_TIME_HOURS} hours in advance.` 
          });
        }
      }
      
      const order = await storage.updateScheduledOrder(req.params.id, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status, note, fulfillmentRef, fulfillmentChannel, changedBy } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "status required" });
      }
      
      // Validate status value
      const validStatuses = ['scheduled', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      
      // Validate fulfillment channel if provided
      if (fulfillmentChannel) {
        const validChannels = ['manual', 'doordash', 'ubereats', 'direct'];
        if (!validChannels.includes(fulfillmentChannel)) {
          return res.status(400).json({ error: `Invalid fulfillment channel. Must be one of: ${validChannels.join(', ')}` });
        }
      }
      
      // Verify order exists
      const existingOrder = await storage.getScheduledOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Update order status
      const updateData: any = { status };
      if (fulfillmentRef) updateData.fulfillmentRef = fulfillmentRef;
      if (fulfillmentChannel) updateData.fulfillmentChannel = fulfillmentChannel;
      
      const order = await storage.updateScheduledOrder(req.params.id, updateData);
      
      // Create status event
      await storage.createOrderEvent({
        orderId: req.params.id,
        status,
        note: note || `Status changed to ${status}`,
        changedBy: changedBy || 'operator'
      });
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      await storage.deleteScheduledOrder(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // ORDER EVENTS ROUTES
  // ========================
  
  app.get("/api/orders/:id/events", async (req, res) => {
    try {
      const events = await storage.getOrderEvents(req.params.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
