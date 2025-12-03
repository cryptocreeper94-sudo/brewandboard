import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCrmNoteSchema, insertClientSchema, insertCrmActivitySchema, insertCrmMeetingSchema } from "@shared/schema";

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

  return httpServer;
}
