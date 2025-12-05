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
  insertFranchiseInquirySchema,
  MINIMUM_ORDER_LEAD_TIME_HOURS,
  HALLMARK_MINTING_FEE,
  FRANCHISE_TIERS
} from "@shared/schema";
import { registerPaymentRoutes } from "./payments";
import { registerHallmarkRoutes } from "./hallmarkRoutes";
import Parser from "rss-parser";
import { Resend } from "resend";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register payment routes (Stripe + Coinbase Commerce)
  registerPaymentRoutes(app);
  
  // Register hallmark routes (Blockchain verification)
  registerHallmarkRoutes(app);
  
  // ========================
  // HEALTH CHECK ROUTES
  // ========================
  
  app.get("/api/health", async (req, res) => {
    const health: { api: string; database: string; timestamp: string } = {
      api: 'healthy',
      database: 'checking',
      timestamp: new Date().toISOString()
    };
    
    try {
      await storage.checkDatabaseHealth();
      health.database = 'healthy';
    } catch (error) {
      health.database = 'offline';
    }
    
    res.json(health);
  });

  // ========================
  // WEATHER ROUTES
  // ========================
  
  let weatherCache: { data: any; fetchedAt: number } | null = null;
  const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  
  app.get("/api/weather/nashville", async (req, res) => {
    try {
      // Check cache first
      if (weatherCache && Date.now() - weatherCache.fetchedAt < WEATHER_CACHE_TTL) {
        return res.json({ ...weatherCache.data, cached: true });
      }
      
      // Fetch from Open-Meteo API (free, no API key needed)
      // Nashville coordinates: 36.16, -86.78
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?' +
        'latitude=36.1627&longitude=-86.7816' +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
        '&temperature_unit=fahrenheit' +
        '&wind_speed_unit=mph' +
        '&precipitation_unit=inch' +
        '&timezone=America/Chicago' +
        '&forecast_days=5'
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      
      // Map weather codes to conditions
      const getWeatherCondition = (code: number) => {
        if (code === 0) return { condition: 'Clear', icon: 'sun' };
        if (code <= 3) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
        if (code <= 48) return { condition: 'Foggy', icon: 'cloud' };
        if (code <= 57) return { condition: 'Drizzle', icon: 'cloud-drizzle' };
        if (code <= 67) return { condition: 'Rain', icon: 'cloud-rain' };
        if (code <= 77) return { condition: 'Snow', icon: 'snowflake' };
        if (code <= 82) return { condition: 'Rain Showers', icon: 'cloud-rain' };
        if (code <= 86) return { condition: 'Snow Showers', icon: 'snowflake' };
        if (code >= 95) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
        return { condition: 'Cloudy', icon: 'cloud' };
      };
      
      const current = data.current;
      const daily = data.daily;
      const currentCondition = getWeatherCondition(current.weather_code);
      
      const weatherData = {
        current: {
          temperature: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          precipitation: current.precipitation,
          condition: currentCondition.condition,
          icon: currentCondition.icon,
          weatherCode: current.weather_code
        },
        forecast: daily.time.map((date: string, i: number) => ({
          date,
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
          ...getWeatherCondition(daily.weather_code[i])
        })),
        lastUpdated: new Date().toISOString()
      };
      
      // Update cache
      weatherCache = { data: weatherData, fetchedAt: Date.now() };
      
      res.json(weatherData);
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Return fallback data if API fails
      res.json({
        current: {
          temperature: 45,
          feelsLike: 42,
          humidity: 65,
          windSpeed: 10,
          precipitation: 0,
          condition: 'Cloudy',
          icon: 'cloud',
          weatherCode: 3
        },
        forecast: [],
        lastUpdated: new Date().toISOString(),
        error: 'Using fallback data'
      });
    }
  });

  // ========================
  // NEWS ROUTES
  // ========================
  
  const rssParser = new Parser({
    customFields: {
      item: ['media:content', 'media:thumbnail']
    },
    timeout: 8000
  });
  
  let newsCache: { items: any[]; fetchedAt: number } | null = null;
  const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes (longer cache to reduce failures)
  
  // Fallback Nashville news data for when feeds are unavailable
  const fallbackNews = [
    { title: "Nashville Weather Update", link: "#", pubDate: new Date().toISOString(), description: "Check your local forecast for Nashville and Middle Tennessee.", image: null },
    { title: "Nashville Business News", link: "#", pubDate: new Date().toISOString(), description: "Stay updated on the latest Nashville business developments.", image: null },
    { title: "Music City Events", link: "#", pubDate: new Date().toISOString(), description: "Discover upcoming events and entertainment in Nashville.", image: null },
    { title: "Tennessee Traffic Updates", link: "#", pubDate: new Date().toISOString(), description: "Real-time traffic information for Middle Tennessee commuters.", image: null }
  ];
  
  app.get("/api/news/nashville", async (req, res) => {
    try {
      // Check cache first (return cache if still valid)
      if (newsCache && Date.now() - newsCache.fetchedAt < NEWS_CACHE_TTL) {
        return res.json({ items: newsCache.items, cached: true });
      }
      
      // Try primary feed (NewsChannel 5 Nashville - more reliable)
      let feed;
      try {
        feed = await rssParser.parseURL('https://www.newschannel5.com/news.rss');
      } catch (e) {
        // Try backup feed
        try {
          feed = await rssParser.parseURL('https://www.tennessean.com/arcio/rss/category/news/');
        } catch (e2) {
          throw new Error('All feeds unavailable');
        }
      }
      
      const items = feed.items.slice(0, 10).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        description: item.contentSnippet?.slice(0, 150) || '',
        image: item['media:content']?.['$']?.url || item['media:thumbnail']?.['$']?.url || null
      }));
      
      // Update cache
      newsCache = { items, fetchedAt: Date.now() };
      
      res.json({ items, cached: false });
    } catch (error: any) {
      console.error('News fetch error:', error.message);
      // Return cached data if available, even if stale
      if (newsCache) {
        return res.json({ items: newsCache.items, cached: true, stale: true });
      }
      // Return fallback news as last resort
      res.json({ items: fallbackNews, cached: false, fallback: true });
    }
  });
  
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
      
      // Send email notification for new order
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const items = validatedData.items as Array<{name: string, quantity: number, price: string}>;
          const itemsList = items.map(item => 
            `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price}</td></tr>`
          ).join('');
          
          await resend.emails.send({
            from: "Brew & Board <onboarding@resend.dev>",
            to: "cryptocreeper94@gmail.com",
            subject: `🚨 NEW ORDER: ${validatedData.vendorName} - ${validatedData.scheduledDate} at ${validatedData.scheduledTime}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0f09; color: #fef3c7; padding: 20px; border-radius: 10px;">
                <h1 style="color: #f59e0b; margin-bottom: 20px;">☕ New Order Received!</h1>
                
                <div style="background: #2d1810; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <h2 style="color: #fcd34d; margin: 0 0 10px 0;">Delivery Details</h2>
                  <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${validatedData.scheduledDate}</p>
                  <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${validatedData.scheduledTime}</p>
                  <p style="margin: 5px 0;"><strong>📍 Address:</strong> ${validatedData.deliveryAddress}</p>
                  ${validatedData.deliveryInstructions ? `<p style="margin: 5px 0;"><strong>📝 Instructions:</strong> ${validatedData.deliveryInstructions}</p>` : ''}
                </div>
                
                <div style="background: #2d1810; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <h2 style="color: #fcd34d; margin: 0 0 10px 0;">Customer Info</h2>
                  <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${validatedData.contactName || 'Not provided'}</p>
                  <p style="margin: 5px 0;"><strong>📱 Phone:</strong> ${validatedData.contactPhone || 'Not provided'}</p>
                </div>
                
                <div style="background: #2d1810; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <h2 style="color: #fcd34d; margin: 0 0 10px 0;">Order from ${validatedData.vendorName}</h2>
                  <table style="width: 100%; border-collapse: collapse; color: #fef3c7;">
                    <thead>
                      <tr style="border-bottom: 2px solid #f59e0b;">
                        <th style="padding: 8px; text-align: left;">Item</th>
                        <th style="padding: 8px; text-align: center;">Qty</th>
                        <th style="padding: 8px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                  </table>
                </div>
                
                <div style="background: #f59e0b; color: #1a0f09; padding: 15px; border-radius: 8px; text-align: center;">
                  <h2 style="margin: 0 0 5px 0;">💰 Total: $${validatedData.total}</h2>
                  <p style="margin: 0; font-size: 14px;">Service Fee: $${validatedData.serviceFee} | Delivery: $${validatedData.deliveryFee}</p>
                </div>
                
                ${validatedData.specialInstructions ? `
                <div style="background: #2d1810; padding: 15px; border-radius: 8px; margin-top: 15px;">
                  <h3 style="color: #fcd34d; margin: 0 0 10px 0;">Special Instructions</h3>
                  <p style="margin: 0;">${validatedData.specialInstructions}</p>
                </div>
                ` : ''}
                
                <p style="text-align: center; margin-top: 20px; color: #a8a29e; font-size: 12px;">
                  Fulfill via DoorDash, UberEats, or direct delivery
                </p>
              </div>
            `
          });
          console.log("Order notification email sent successfully");
        } catch (emailError) {
          console.error("Failed to send order notification email:", emailError);
        }
      }
      
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

  // ========================
  // SCANNED DOCUMENTS ROUTES
  // ========================

  app.get("/api/documents", async (req, res) => {
    try {
      const { userId, category, clientId, search, limit } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const documents = await storage.getScannedDocuments(
        userId as string,
        {
          category: category as string | undefined,
          clientId: clientId as string | undefined,
          search: search as string | undefined,
          limit: limit ? parseInt(limit as string) : undefined
        }
      );
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getScannedDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const { userId, title, category, extractedText, pageCount, imageData, thumbnailData, clientId, noteId, meetingId, tags, language } = req.body;
      
      if (!userId || !title) {
        return res.status(400).json({ error: "userId and title are required" });
      }
      
      const document = await storage.createScannedDocument({
        userId,
        title,
        category: category || "general",
        extractedText,
        pageCount: pageCount || 1,
        imageData,
        thumbnailData,
        clientId,
        noteId,
        meetingId,
        tags,
        language: language || "eng"
      });
      
      res.status(201).json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const existingDoc = await storage.getScannedDocument(req.params.id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const document = await storage.updateScannedDocument(req.params.id, req.body);
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteScannedDocument(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/search/:userId", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: "Search query (q) is required" });
      }
      
      const documents = await storage.searchScannedDocuments(req.params.userId, q as string);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // FRANCHISE ROUTES
  // ========================
  
  // Get franchise tiers (public)
  app.get("/api/franchise/tiers", async (req, res) => {
    res.json(FRANCHISE_TIERS);
  });
  
  // Submit franchise inquiry (public)
  app.post("/api/franchise/inquiries", async (req, res) => {
    try {
      const result = insertFranchiseInquirySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message || "Invalid inquiry data" });
      }
      
      const inquiry = await storage.createFranchiseInquiry(result.data);
      
      // Send email notification via Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const tierInfo = result.data.interestedTier ? 
          FRANCHISE_TIERS[result.data.interestedTier as keyof typeof FRANCHISE_TIERS] : null;
        
        await resend.emails.send({
          from: "Brew & Board <onboarding@resend.dev>",
          to: "cryptocreeper94@gmail.com",
          replyTo: result.data.email,
          subject: `[Franchise Inquiry] ${result.data.name} - ${result.data.preferredTerritory || 'Territory TBD'}`,
          html: `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0f09 0%, #3d2216 100%); color: #fef3c7; padding: 30px; border-radius: 12px;">
              <div style="text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Brew & Board Coffee</h1>
                <p style="color: #fcd34d; margin: 5px 0 0;">New Franchise Inquiry</p>
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Contact Information</h2>
                <p><strong>Name:</strong> ${result.data.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${result.data.email}" style="color: #fbbf24;">${result.data.email}</a></p>
                ${result.data.phone ? `<p><strong>Phone:</strong> ${result.data.phone}</p>` : ''}
                ${result.data.company ? `<p><strong>Company:</strong> ${result.data.company}</p>` : ''}
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Franchise Interest</h2>
                ${tierInfo ? `
                  <p><strong>Interested Tier:</strong> ${tierInfo.name} (${tierInfo.fee})</p>
                  <p><strong>Royalty:</strong> ${tierInfo.royaltyPercent} per order</p>
                  <p><strong>Platform Fee:</strong> ${tierInfo.platformFee}</p>
                ` : '<p><strong>Interested Tier:</strong> Not specified</p>'}
                <p><strong>Preferred Territory:</strong> ${result.data.preferredTerritory || 'Not specified'}</p>
                ${result.data.investmentBudget ? `<p><strong>Investment Budget:</strong> ${result.data.investmentBudget}</p>` : ''}
                ${result.data.timelineToStart ? `<p><strong>Timeline to Start:</strong> ${result.data.timelineToStart}</p>` : ''}
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Background</h2>
                <p><strong>Business Experience:</strong> ${result.data.hasBusinessExperience ? 'Yes' : 'No'}</p>
                <p><strong>Food Service Experience:</strong> ${result.data.hasFoodServiceExperience ? 'Yes' : 'No'}</p>
                ${result.data.currentOccupation ? `<p><strong>Current Occupation:</strong> ${result.data.currentOccupation}</p>` : ''}
                ${result.data.additionalNotes ? `
                  <div style="margin-top: 15px;">
                    <p><strong>Additional Notes:</strong></p>
                    <p style="white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">${result.data.additionalNotes}</p>
                  </div>
                ` : ''}
              </div>
              
              <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin-top: 20px;">
                Submitted via Brew & Board Franchise Portal | ${new Date().toLocaleString()}
              </p>
            </div>
          `
        });
        
        console.log("Franchise inquiry email sent successfully");
      }
      
      res.status(201).json({ 
        success: true, 
        inquiry,
        message: "Thank you for your interest! We'll contact you within 48 hours."
      });
    } catch (error: any) {
      console.error("Franchise inquiry error:", error);
      res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
    }
  });
  
  // Get all franchise inquiries (admin)
  app.get("/api/franchise/inquiries", async (req, res) => {
    try {
      const { status } = req.query;
      const inquiries = await storage.getFranchiseInquiries({ 
        status: status as string | undefined 
      });
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update franchise inquiry status (admin)
  app.patch("/api/franchise/inquiries/:id", async (req, res) => {
    try {
      const inquiry = await storage.updateFranchiseInquiry(req.params.id, req.body);
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all franchises (admin)
  app.get("/api/franchises", async (req, res) => {
    try {
      const { status, ownerId } = req.query;
      const franchiseList = await storage.getFranchises({ 
        status: status as string | undefined,
        ownerId: ownerId as string | undefined
      });
      res.json(franchiseList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get franchise by ID
  app.get("/api/franchises/:id", async (req, res) => {
    try {
      const franchise = await storage.getFranchise(req.params.id);
      if (!franchise) {
        return res.status(404).json({ error: "Franchise not found" });
      }
      res.json(franchise);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // CONTACT FORM ROUTE
  // ========================
  
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      // Log contact form submission
      console.log("=== CONTACT FORM SUBMISSION ===");
      console.log(`From: ${name} <${email}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log("================================");
      
      // Send email via Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: "Brew & Board <onboarding@resend.dev>",
          to: "cryptocreeper94@gmail.com",
          replyTo: email,
          subject: `[Contact Form] ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3d2418; border-bottom: 2px solid #5c4033; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                Sent from Brew & Board Coffee contact form
              </p>
            </div>
          `
        });
        
        console.log("Email sent successfully via Resend");
      } else {
        console.log("RESEND_API_KEY not configured - email not sent");
      }
      
      res.json({ 
        success: true, 
        message: "Message sent! We'll get back to you soon.",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  return httpServer;
}
