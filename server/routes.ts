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
  insertVendorApplicationSchema,
  insertRegionSchema,
  insertRegionalManagerSchema,
  insertBusinessCardSchema,
  insertMeetingPresentationSchema,
  MINIMUM_ORDER_LEAD_TIME_HOURS,
  MAX_CONCURRENT_ORDERS,
  CAPACITY_WINDOW_HOURS,
  HALLMARK_MINTING_FEE,
  FRANCHISE_TIERS,
  PRESENTATION_TEMPLATES
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
  // BUSINESS CARDS ROUTES
  // ========================
  
  app.get("/api/business-cards", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const cards = await storage.getBusinessCards(userId);
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/business-cards/default", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const card = await storage.getDefaultBusinessCard(userId);
      res.json(card || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/business-cards/:id", async (req, res) => {
    try {
      const card = await storage.getBusinessCard(req.params.id);
      if (!card) {
        return res.status(404).json({ error: "Business card not found" });
      }
      res.json(card);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/business-cards", async (req, res) => {
    try {
      const validatedData = insertBusinessCardSchema.parse(req.body);
      const card = await storage.createBusinessCard(validatedData);
      res.json(card);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/business-cards/:id", async (req, res) => {
    try {
      const card = await storage.updateBusinessCard(req.params.id, req.body);
      res.json(card);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/business-cards/:id", async (req, res) => {
    try {
      await storage.deleteBusinessCard(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/business-cards/:id/view", async (req, res) => {
    try {
      await storage.incrementBusinessCardViews(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // MEETING PRESENTATIONS ROUTES
  // ========================
  
  app.get("/api/meeting-presentations/templates", async (req, res) => {
    res.json(PRESENTATION_TEMPLATES);
  });

  app.get("/api/meeting-presentations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const presentations = await storage.getMeetingPresentations(userId);
      res.json(presentations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/meeting-presentations/:id", async (req, res) => {
    try {
      const presentation = await storage.getMeetingPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json(presentation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/meeting-presentations/view/:link", async (req, res) => {
    try {
      const presentation = await storage.getMeetingPresentationByLink(req.params.link);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      await storage.incrementPresentationViews(presentation.id);
      
      let documents: any[] = [];
      if (presentation.documentIds && presentation.documentIds.length > 0) {
        const docPromises = presentation.documentIds.map(id => storage.getScannedDocument(id));
        documents = (await Promise.all(docPromises)).filter(Boolean);
      }
      
      res.json({ presentation, documents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/meeting-presentations", async (req, res) => {
    try {
      const validatedData = insertMeetingPresentationSchema.parse(req.body);
      const presentation = await storage.createMeetingPresentation(validatedData);
      res.json(presentation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/meeting-presentations/:id", async (req, res) => {
    try {
      const presentation = await storage.updateMeetingPresentation(req.params.id, req.body);
      res.json(presentation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/meeting-presentations/:id", async (req, res) => {
    try {
      await storage.deleteMeetingPresentation(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/meeting-presentations/:id/send", async (req, res) => {
    try {
      const presentation = await storage.getMeetingPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      if (!presentation.attendeeEmails || presentation.attendeeEmails.length === 0) {
        return res.status(400).json({ error: "No attendees to send to" });
      }
      
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : 'http://localhost:5000';
      const viewUrl = `${baseUrl}/presentation/${presentation.shareableLink}`;
      
      const template = PRESENTATION_TEMPLATES.find(t => t.id === presentation.templateType);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Georgia, serif; background: #1a0f09; color: #fef3c7; margin: 0; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #2d1810 0%, #3d2418 100%); border-radius: 16px; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { color: #d97706; font-size: 24px; font-weight: bold; }
              h1 { color: #fef3c7; margin: 20px 0; font-size: 28px; }
              .subtitle { color: #fcd34d; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
              .content { background: rgba(13, 7, 5, 0.5); border-radius: 12px; padding: 30px; margin: 20px 0; }
              .btn { display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #92400e; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">☕ Brew & Board</div>
                <div class="subtitle">${template?.name || 'Meeting Presentation'}</div>
                <h1>${presentation.title}</h1>
              </div>
              <div class="content">
                <p>You've been invited to view a meeting presentation.</p>
                ${presentation.description ? `<p style="color: #fcd34d;">${presentation.description}</p>` : ''}
                ${presentation.meetingDate ? `<p><strong>Date:</strong> ${new Date(presentation.meetingDate).toLocaleDateString()}</p>` : ''}
                ${presentation.meetingTime ? `<p><strong>Time:</strong> ${presentation.meetingTime}</p>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${viewUrl}" class="btn">View Presentation</a>
              </div>
              <div class="footer">
                <p>Powered by Brew & Board Coffee</p>
                <p>Nashville's Premier B2B Coffee Delivery</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const { data, error } = await resend.emails.send({
        from: 'Brew & Board <presentations@brewandboard.coffee>',
        to: presentation.attendeeEmails,
        subject: `Meeting Presentation: ${presentation.title}`,
        html: emailHtml,
      });
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      await storage.updateMeetingPresentation(req.params.id, {
        status: 'sent',
        sentAt: new Date(),
      } as any);
      
      res.json({ success: true, emailId: data?.id });
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

  // Check capacity for a specific time slot
  app.get("/api/orders/capacity/check", async (req, res) => {
    try {
      const date = req.query.date as string;
      const time = req.query.time as string;
      
      if (!date || !time) {
        return res.status(400).json({ error: "date and time query parameters required" });
      }
      
      const concurrentOrders = await storage.getConcurrentOrdersCount(date, time, CAPACITY_WINDOW_HOURS);
      const spotsRemaining = Math.max(0, MAX_CONCURRENT_ORDERS - concurrentOrders);
      
      res.json({
        date,
        time,
        currentOrders: concurrentOrders,
        maxOrders: MAX_CONCURRENT_ORDERS,
        windowHours: CAPACITY_WINDOW_HOURS,
        spotsRemaining,
        isAtCapacity: concurrentOrders >= MAX_CONCURRENT_ORDERS,
        capacityLevel: concurrentOrders === 0 ? 'open' 
          : concurrentOrders < MAX_CONCURRENT_ORDERS / 2 ? 'low' 
          : concurrentOrders < MAX_CONCURRENT_ORDERS ? 'medium' 
          : 'full'
      });
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
      
      // Check capacity - 2-person team can handle max 4 concurrent orders in 2-hour window
      const concurrentOrders = await storage.getConcurrentOrdersCount(
        validatedData.scheduledDate,
        validatedData.scheduledTime,
        CAPACITY_WINDOW_HOURS
      );
      
      if (concurrentOrders >= MAX_CONCURRENT_ORDERS) {
        return res.status(409).json({ 
          error: `This time slot is at capacity. Our team can handle ${MAX_CONCURRENT_ORDERS} deliveries within a ${CAPACITY_WINDOW_HOURS}-hour window. Please select a different delivery time.`,
          capacityInfo: {
            currentOrders: concurrentOrders,
            maxOrders: MAX_CONCURRENT_ORDERS,
            windowHours: CAPACITY_WINDOW_HOURS
          }
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
            from: "Brew & Board <orders@brewandboard.coffee>",
            to: "sipandmeet@brewandboard.coffee",
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
                  <p style="margin: 0; font-size: 14px;">Subtotal: $${validatedData.subtotal} | TN Tax: $${validatedData.salesTax || '0.00'}</p>
                  <p style="margin: 0; font-size: 14px;">Service: $${validatedData.serviceFee} | Delivery: $${validatedData.deliveryFee} | Gratuity: $${validatedData.gratuity || '0.00'}</p>
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
          from: "Brew & Board <franchise@brewandboard.coffee>",
          to: "sipandmeet@brewandboard.coffee",
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
  // VENDOR APPLICATION ROUTES
  // ========================
  
  // Submit vendor application (public)
  app.post("/api/vendors/apply", async (req, res) => {
    try {
      const result = insertVendorApplicationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message || "Invalid application data" });
      }
      
      const application = await storage.createVendorApplication(result.data);
      
      // Send email notification via Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: "Brew & Board <vendors@brewandboard.coffee>",
          to: "sipandmeet@brewandboard.coffee",
          replyTo: result.data.email,
          subject: `[New Vendor] ${result.data.businessName} - ${result.data.city}`,
          html: `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0f09 0%, #3d2216 100%); color: #fef3c7; padding: 30px; border-radius: 12px;">
              <div style="text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Brew & Board Coffee</h1>
                <p style="color: #fcd34d; margin: 5px 0 0;">New Vendor Application</p>
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Business Information</h2>
                <p><strong>Business Name:</strong> ${result.data.businessName}</p>
                <p><strong>Type:</strong> ${result.data.businessType}</p>
                <p><strong>Address:</strong> ${result.data.address}, ${result.data.city} ${result.data.zipCode}</p>
                ${result.data.neighborhood ? `<p><strong>Neighborhood:</strong> ${result.data.neighborhood}</p>` : ''}
                ${result.data.website ? `<p><strong>Website:</strong> <a href="${result.data.website}" style="color: #fbbf24;">${result.data.website}</a></p>` : ''}
                ${result.data.instagram ? `<p><strong>Instagram:</strong> @${result.data.instagram}</p>` : ''}
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Contact Information</h2>
                <p><strong>Owner:</strong> ${result.data.ownerName}</p>
                <p><strong>Email:</strong> <a href="mailto:${result.data.email}" style="color: #fbbf24;">${result.data.email}</a></p>
                <p><strong>Phone:</strong> ${result.data.phone}</p>
              </div>
              
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Business Details</h2>
                ${result.data.yearsInBusiness ? `<p><strong>Years in Business:</strong> ${result.data.yearsInBusiness}</p>` : ''}
                ${result.data.averageOrderValue ? `<p><strong>Average Order:</strong> ${result.data.averageOrderValue}</p>` : ''}
                ${result.data.maxOrderSize ? `<p><strong>Max Order Size:</strong> ${result.data.maxOrderSize}</p>` : ''}
                ${result.data.leadTimeNeeded ? `<p><strong>Lead Time Needed:</strong> ${result.data.leadTimeNeeded}</p>` : ''}
                <p><strong>Can Handle Catering:</strong> ${result.data.canHandleCatering ? 'Yes' : 'No'}</p>
              </div>
              
              ${result.data.menuHighlights ? `
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Menu Highlights</h2>
                <p style="white-space: pre-wrap;">${result.data.menuHighlights}</p>
              </div>
              ` : ''}
              
              ${result.data.whyJoin ? `
              <div style="background: rgba(180, 83, 9, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #fbbf24; margin-top: 0;">Why They Want to Join</h2>
                <p style="white-space: pre-wrap;">${result.data.whyJoin}</p>
              </div>
              ` : ''}
              
              <p style="color: #a3a3a3; font-size: 12px; text-align: center; margin-top: 20px;">
                Submitted via Brew & Board Vendor Portal | ${new Date().toLocaleString()}
              </p>
            </div>
          `
        });
        
        console.log("Vendor application email sent successfully");
      }
      
      res.status(201).json({ 
        success: true, 
        application,
        message: "Thank you for applying! We'll review your application and contact you within 48 hours."
      });
    } catch (error: any) {
      console.error("Vendor application error:", error);
      res.status(500).json({ error: "Failed to submit application. Please try again." });
    }
  });
  
  // Get all vendor applications (admin)
  app.get("/api/vendors/applications", async (req, res) => {
    try {
      const { status } = req.query;
      const applications = await storage.getVendorApplications({ 
        status: status as string | undefined 
      });
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update vendor application status (admin)
  app.patch("/api/vendors/applications/:id", async (req, res) => {
    try {
      const application = await storage.updateVendorApplication(req.params.id, req.body);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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
          from: "Brew & Board <hello@brewandboard.coffee>",
          to: "sipandmeet@brewandboard.coffee",
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

  // ========================
  // REGIONAL MANAGER ROUTES
  // ========================
  
  // Server-side session storage for regional managers (in production, use Redis)
  const regionalSessions = new Map<string, { managerId: string; regionId: string | null; expiresAt: number }>();
  
  // Generate cryptographically secure random token
  const generateSessionToken = (): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex'); // 64 character hex token
  };
  
  // Helper: Verify regional manager session from header
  const verifyRegionalSession = async (req: any, allowPinChange: boolean = false): Promise<{ 
    managerId: string; 
    regionId: string | null;
    role: string;
    mustChangePin: boolean;
  } | null> => {
    const token = req.headers['x-regional-token'];
    if (!token) return null;
    
    const session = regionalSessions.get(token as string);
    if (!session) return null;
    
    // Check expiration
    if (Date.now() > session.expiresAt) {
      regionalSessions.delete(token as string);
      return null;
    }
    
    // Verify manager still exists and is active
    const manager = await storage.getRegionalManager(session.managerId);
    if (!manager || !manager.isActive) {
      regionalSessions.delete(token as string);
      return null;
    }
    
    return { 
      managerId: session.managerId, 
      regionId: session.regionId,
      role: manager.role || "regional_manager",
      mustChangePin: manager.mustChangePin === true
    };
  };
  
  // Helper: Check if PIN change is required (blocks most routes)
  const requirePinChanged = async (req: any, res: any): Promise<boolean> => {
    const session = await verifyRegionalSession(req);
    if (!session) {
      res.status(401).json({ error: "Authentication required" });
      return false;
    }
    if (session.mustChangePin) {
      res.status(403).json({ error: "PIN change required before accessing this resource" });
      return false;
    }
    return true;
  };

  // Master PINs for initial access
  const MASTER_PINS = {
    PARTNER: "4444",      // Sid - Partner level, full access, sees all managers
    DEMO: "5555"          // Demo partner login - 2-day session for potential partners
  };

  // Regional manager login by PIN (rate-limited in production)
  app.post("/api/regional-managers/login", async (req, res) => {
    try {
      const { pin } = req.body;
      if (!pin || pin.length !== 4) {
        return res.status(400).json({ error: "Valid 4-digit PIN is required" });
      }
      
      let manager = await storage.getRegionalManagerByPin(pin);
      
      // Check if using master PIN to create new account
      if (!manager) {
        if (pin === MASTER_PINS.PARTNER) {
          // Check if Sid's partner account already exists
          const existingManagers = await storage.getRegionalManagers({ isActive: true });
          const partnerExists = existingManagers.some(m => m.role === "partner" && m.name === "Sid");
          
          if (partnerExists) {
            return res.status(400).json({ 
              error: "Partner account already exists. Please use your personal PIN to login." 
            });
          }
          
          // Create Sid's partner account (one-time registration)
          const nashvilleRegion = await storage.getRegionByCode("TN-NASH");
          manager = await storage.createRegionalManager({
            name: "Sid",
            email: `partner_${Date.now()}@brewandboard.coffee`,
            phone: "",
            pin: pin,
            role: "partner",
            regionId: nashvilleRegion?.id || null,
            title: "Partner",
            isActive: true,
            mustChangePin: true,
            hasSeenWelcome: false
          });
        } else if (pin === MASTER_PINS.DEMO) {
          // Demo partner login - creates temporary demo account or reuses existing
          const existingManagers = await storage.getRegionalManagers({ isActive: true });
          const demoExists = existingManagers.find(m => m.role === "demo_partner");
          
          if (demoExists) {
            manager = demoExists;
          } else {
            // Create demo partner account
            const nashvilleRegion = await storage.getRegionByCode("TN-NASH");
            manager = await storage.createRegionalManager({
              name: "Demo Partner",
              email: `demo_${Date.now()}@brewandboard.coffee`,
              phone: "",
              pin: pin,
              role: "demo_partner",
              regionId: nashvilleRegion?.id || null,
              title: "Demo Partner",
              isActive: true,
              mustChangePin: false,  // Demo doesn't require PIN change
              hasSeenWelcome: false
            });
          }
        } else {
          // Constant-time-ish delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 500));
          return res.status(401).json({ error: "Invalid PIN" });
        }
      }
      
      if (!manager.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }
      
      // Get their region info
      let region = null;
      if (manager.regionId) {
        region = await storage.getRegion(manager.regionId);
      }
      
      // Generate server-side session token
      const token = generateSessionToken();
      // Demo partners get 2-day sessions, regular users get 24 hours
      const isDemo = manager.role === "demo_partner";
      const sessionDuration = isDemo ? (2 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
      const expiresAt = Date.now() + sessionDuration;
      
      regionalSessions.set(token, {
        managerId: manager.id,
        regionId: manager.regionId,
        expiresAt
      });
      
      // Return manager WITHOUT PIN for security, WITH token
      const { pin: _, ...safeManager } = manager;
      res.json({ 
        manager: safeManager, 
        region, 
        token,
        isDemo,
        sessionExpiresIn: isDemo ? "2 days" : "24 hours"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update manager PIN (authenticated)
  app.post("/api/regional-managers/change-pin", async (req, res) => {
    try {
      const session = await verifyRegionalSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { newPin } = req.body;
      if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        return res.status(400).json({ error: "PIN must be exactly 4 digits" });
      }
      
      // Check if PIN is a master PIN
      if (newPin === MASTER_PINS.PARTNER || newPin === MASTER_PINS.DEMO) {
        return res.status(400).json({ error: "This PIN is reserved. Please choose a different PIN." });
      }
      
      // Check if PIN already exists
      const existing = await storage.getRegionalManagerByPin(newPin);
      if (existing && existing.id !== session.managerId) {
        return res.status(400).json({ error: "This PIN is already in use. Please choose a different PIN." });
      }
      
      const updated = await storage.updateRegionalManager(session.managerId, {
        pin: newPin,
        mustChangePin: false
      });
      
      const { pin: _, ...safeManager } = updated;
      res.json({ manager: safeManager, message: "PIN updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Mark welcome modal as seen (authenticated)
  app.post("/api/regional-managers/acknowledge-welcome", async (req, res) => {
    try {
      const session = await verifyRegionalSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const updated = await storage.updateRegionalManager(session.managerId, {
        hasSeenWelcome: true
      });
      
      const { pin: _, ...safeManager } = updated;
      res.json({ manager: safeManager });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all regional managers (partner/demo_partner only - for accordion view)
  app.get("/api/regional/all-managers", async (req, res) => {
    try {
      const session = await verifyRegionalSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Verify this user is a partner or demo partner (full access roles)
      const manager = await storage.getRegionalManager(session.managerId);
      const hasPartnerAccess = manager?.role === "partner" || manager?.role === "demo_partner";
      if (!manager || !hasPartnerAccess) {
        return res.status(403).json({ error: "Partner access required" });
      }
      
      // Get all managers (excluding PIN)
      const allManagers = await storage.getRegionalManagers({ isActive: true });
      const safeManagers = allManagers.map(m => {
        const { pin: _, ...safe } = m;
        return safe;
      });
      
      // Get all regions for reference
      const allRegions = await storage.getRegions();
      
      res.json({ managers: safeManagers, regions: allRegions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Logout endpoint
  app.post("/api/regional-managers/logout", async (req, res) => {
    const token = req.headers['x-regional-token'];
    if (token) {
      regionalSessions.delete(token as string);
    }
    res.json({ success: true });
  });

  // Get my region (authenticated - requires session)
  app.get("/api/regional/my-region", async (req, res) => {
    try {
      const session = await verifyRegionalSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      if (!session.regionId) {
        return res.status(404).json({ error: "No region assigned" });
      }
      
      const region = await storage.getRegion(session.regionId);
      res.json(region);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get my region stats (authenticated - tenant-scoped)
  app.get("/api/regional/my-stats", async (req, res) => {
    try {
      const session = await verifyRegionalSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      if (!session.regionId) {
        return res.status(404).json({ error: "No region assigned" });
      }
      
      const stats = await storage.getRegionStats(session.regionId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seed demo region and manager (development only)
  app.post("/api/regional-managers/seed-demo", async (req, res) => {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "This endpoint is disabled in production" });
    }
    
    try {
      // Check if Nashville region exists
      let nashvilleRegion = await storage.getRegionByCode("TN-NASH");
      
      if (!nashvilleRegion) {
        nashvilleRegion = await storage.createRegion({
          name: "Nashville Metro",
          code: "TN-NASH",
          state: "TN",
          cities: ["Nashville", "Franklin", "Brentwood", "Murfreesboro"],
          status: "active",
          targetRevenue: "50000.00"
        });
      }
      
      // Check if demo manager exists
      let demoManager = await storage.getRegionalManagerByEmail("demo.manager@brewandboard.coffee");
      
      if (!demoManager) {
        demoManager = await storage.createRegionalManager({
          name: "Alex Thompson",
          email: "demo.manager@brewandboard.coffee",
          phone: "615-555-0100",
          pin: "1234", // In production, this should be hashed
          role: "regional_manager",
          regionId: nashvilleRegion.id,
          title: "Regional Manager - Nashville",
          isActive: true,
          salesTarget: "25000.00"
        });
      }
      
      // Return without PIN
      const { pin: _, ...safeManager } = demoManager;
      res.json({ region: nashvilleRegion, manager: safeManager, message: "Use PIN 1234 to login" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // TEAM CHAT ROUTES
  // ========================
  
  app.get("/api/team-chat/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getTeamChatMessages(limit);
      // Reverse to get chronological order (oldest first)
      res.json(messages.reverse());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/team-chat/messages", async (req, res) => {
    try {
      const { senderId, senderName, senderRole, message } = req.body;
      
      if (!senderId || !senderName || !message) {
        return res.status(400).json({ error: "senderId, senderName, and message are required" });
      }
      
      const newMessage = await storage.createTeamChatMessage({
        senderId,
        senderName,
        senderRole: senderRole || null,
        message
      });
      
      res.json(newMessage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // VIRTUAL HOST ROUTES (Multi-Location Orders)
  // ========================
  
  // Generate random token for invites
  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // Get all virtual meetings for a host
  app.get("/api/virtual-meetings", async (req, res) => {
    try {
      const hostUserId = req.query.hostUserId as string | undefined;
      const meetings = await storage.getVirtualMeetings(hostUserId);
      res.json(meetings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific virtual meeting with all details
  app.get("/api/virtual-meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.getVirtualMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      // Get all related data
      const attendees = await storage.getVirtualAttendees(meeting.id);
      const orders = await storage.getVirtualOrders(meeting.id);
      const events = await storage.getVirtualMeetingEvents(meeting.id);
      
      // Get selections for each attendee
      const attendeesWithSelections = await Promise.all(
        attendees.map(async (attendee) => {
          const selection = await storage.getVirtualSelection(attendee.id);
          return { ...attendee, selection };
        })
      );
      
      res.json({
        ...meeting,
        attendees: attendeesWithSelections,
        orders,
        events
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get virtual meeting by invite token (public)
  app.get("/api/virtual-meetings/invite/:token", async (req, res) => {
    try {
      const meeting = await storage.getVirtualMeetingByToken(req.params.token);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      // Return limited info for public view
      res.json({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        meetingDate: meeting.meetingDate,
        meetingTime: meeting.meetingTime,
        timezone: meeting.timezone,
        hostName: meeting.hostName,
        hostCompany: meeting.hostCompany,
        budgetType: meeting.budgetType,
        perPersonBudgetCents: meeting.perPersonBudgetCents,
        deliveryScope: meeting.deliveryScope,
        status: meeting.status
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new virtual meeting
  app.post("/api/virtual-meetings", async (req, res) => {
    try {
      const inviteToken = generateToken();
      
      const meeting = await storage.createVirtualMeeting({
        ...req.body,
        inviteToken,
        status: 'draft'
      });
      
      // Create initial event
      await storage.createVirtualMeetingEvent({
        meetingId: meeting.id,
        eventType: 'created',
        message: `Meeting "${meeting.title}" created`
      });
      
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a virtual meeting
  app.patch("/api/virtual-meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.updateVirtualMeeting(req.params.id, req.body);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a virtual meeting
  app.delete("/api/virtual-meetings/:id", async (req, res) => {
    try {
      await storage.deleteVirtualMeeting(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add attendees to a meeting
  app.post("/api/virtual-meetings/:id/attendees", async (req, res) => {
    try {
      const meetingId = req.params.id;
      const { attendees } = req.body;
      
      if (!Array.isArray(attendees)) {
        return res.status(400).json({ error: "attendees must be an array" });
      }
      
      const meeting = await storage.getVirtualMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      const createdAttendees = [];
      
      for (const attendee of attendees) {
        const attendeeToken = generateToken();
        const created = await storage.createVirtualAttendee({
          meetingId,
          name: attendee.name,
          email: attendee.email || null,
          phone: attendee.phone || null,
          locationLabel: attendee.locationLabel || null,
          addressLine1: attendee.addressLine1 || null,
          addressLine2: attendee.addressLine2 || null,
          city: attendee.city || null,
          state: attendee.state || null,
          zipCode: attendee.zipCode || null,
          deliveryInstructions: attendee.deliveryInstructions || null,
          attendeeToken,
          inviteStatus: 'pending'
        });
        createdAttendees.push(created);
      }
      
      // Update meeting status to collecting
      await storage.updateVirtualMeeting(meetingId, { status: 'collecting' });
      
      // Log event
      await storage.createVirtualMeetingEvent({
        meetingId,
        eventType: 'invite_sent',
        message: `${attendees.length} attendee(s) added to meeting`
      });
      
      res.json(createdAttendees);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get attendee by token (public - for attendee to fill in their order)
  app.get("/api/virtual-attendee/:token", async (req, res) => {
    try {
      const attendee = await storage.getVirtualAttendeeByToken(req.params.token);
      if (!attendee) {
        return res.status(404).json({ error: "Attendee not found" });
      }
      
      const meeting = await storage.getVirtualMeeting(attendee.meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      const selection = await storage.getVirtualSelection(attendee.id);
      
      // Mark as viewed if pending
      if (attendee.inviteStatus === 'pending' || attendee.inviteStatus === 'invited') {
        await storage.updateVirtualAttendee(attendee.id, { inviteStatus: 'viewed' });
        await storage.createVirtualMeetingEvent({
          meetingId: meeting.id,
          attendeeId: attendee.id,
          eventType: 'invite_viewed',
          message: `${attendee.name} viewed their invite`
        });
      }
      
      res.json({
        attendee,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          meetingDate: meeting.meetingDate,
          meetingTime: meeting.meetingTime,
          timezone: meeting.timezone,
          hostName: meeting.hostName,
          hostCompany: meeting.hostCompany,
          budgetType: meeting.budgetType,
          perPersonBudgetCents: meeting.perPersonBudgetCents,
          deliveryScope: meeting.deliveryScope,
          status: meeting.status
        },
        selection
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Attendee submits their order selection
  app.post("/api/virtual-attendee/:token/submit", async (req, res) => {
    try {
      const attendee = await storage.getVirtualAttendeeByToken(req.params.token);
      if (!attendee) {
        return res.status(404).json({ error: "Attendee not found" });
      }
      
      const meeting = await storage.getVirtualMeeting(attendee.meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      const { items, specialRequests, addressLine1, addressLine2, city, state, zipCode, deliveryInstructions } = req.body;
      
      // Update attendee address if provided
      if (addressLine1) {
        await storage.updateVirtualAttendee(attendee.id, {
          addressLine1,
          addressLine2: addressLine2 || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          deliveryInstructions: deliveryInstructions || null,
          inviteStatus: 'submitted',
          submittedAt: new Date()
        });
      } else {
        await storage.updateVirtualAttendee(attendee.id, {
          inviteStatus: 'submitted',
          submittedAt: new Date()
        });
      }
      
      // Calculate subtotal
      const subtotalCents = items.reduce((sum: number, item: any) => 
        sum + (item.priceCents * item.quantity), 0
      );
      
      // Check budget
      const budgetCents = meeting.perPersonBudgetCents || 1500;
      const budgetStatus = subtotalCents <= budgetCents ? 'under' : 'over';
      const overageCents = subtotalCents > budgetCents ? subtotalCents - budgetCents : 0;
      
      // Check if selection already exists
      const existingSelection = await storage.getVirtualSelection(attendee.id);
      
      if (existingSelection) {
        await storage.updateVirtualSelection(existingSelection.id, {
          items,
          subtotalCents,
          budgetStatus,
          overageCents,
          specialRequests: specialRequests || null
        });
      } else {
        await storage.createVirtualSelection({
          attendeeId: attendee.id,
          items,
          subtotalCents,
          budgetStatus,
          overageCents,
          specialRequests: specialRequests || null
        });
      }
      
      // Log event
      await storage.createVirtualMeetingEvent({
        meetingId: meeting.id,
        attendeeId: attendee.id,
        eventType: 'selection_submitted',
        message: `${attendee.name} submitted their order ($${(subtotalCents / 100).toFixed(2)})`
      });
      
      if (budgetStatus === 'over') {
        await storage.createVirtualMeetingEvent({
          meetingId: meeting.id,
          attendeeId: attendee.id,
          eventType: 'budget_exceeded',
          message: `${attendee.name} exceeded budget by $${(overageCents / 100).toFixed(2)}`
        });
      }
      
      res.json({ success: true, budgetStatus, overageCents });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update attendee
  app.patch("/api/virtual-attendees/:id", async (req, res) => {
    try {
      const attendee = await storage.updateVirtualAttendee(req.params.id, req.body);
      res.json(attendee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete attendee
  app.delete("/api/virtual-attendees/:id", async (req, res) => {
    try {
      await storage.deleteVirtualAttendee(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create simulated orders for demo (Coming Soon feature)
  app.post("/api/virtual-meetings/:id/simulate-orders", async (req, res) => {
    try {
      const meetingId = req.params.id;
      const meeting = await storage.getVirtualMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      const attendees = await storage.getVirtualAttendees(meetingId);
      const createdOrders = [];
      
      for (const attendee of attendees) {
        if (attendee.inviteStatus !== 'submitted') continue;
        
        const selection = await storage.getVirtualSelection(attendee.id);
        if (!selection) continue;
        
        const order = await storage.createVirtualOrder({
          meetingId,
          attendeeId: attendee.id,
          provider: meeting.deliveryScope === 'local' ? 'local' : 'manual',
          status: 'placed',
          subtotalCents: selection.subtotalCents || 0,
          deliveryFeeCents: 350,
          serviceFeeCents: Math.round((selection.subtotalCents || 0) * 0.15),
          taxCents: Math.round((selection.subtotalCents || 0) * 0.0925),
          tipCents: 0,
          totalCents: (selection.subtotalCents || 0) + 350 + 
            Math.round((selection.subtotalCents || 0) * 0.15) + 
            Math.round((selection.subtotalCents || 0) * 0.0925)
        });
        
        createdOrders.push(order);
        
        await storage.createVirtualMeetingEvent({
          meetingId,
          attendeeId: attendee.id,
          eventType: 'order_placed',
          message: `Order placed for ${attendee.name}`
        });
      }
      
      // Update meeting status
      await storage.updateVirtualMeeting(meetingId, { status: 'ordered' });
      
      res.json({ orders: createdOrders, count: createdOrders.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // ERROR REPORTS (Bug/Issue Tracking)
  // ========================
  
  app.get("/api/error-reports", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const reports = await storage.getErrorReports(status);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/error-reports/:id", async (req, res) => {
    try {
      const report = await storage.getErrorReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/error-reports", async (req, res) => {
    try {
      const report = await storage.createErrorReport({
        ...req.body,
        userAgent: req.headers['user-agent'] || null,
      });
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/error-reports/:id", async (req, res) => {
    try {
      const report = await storage.updateErrorReport(req.params.id, req.body);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
