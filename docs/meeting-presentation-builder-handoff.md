# Meeting Presentation Builder - Agent Handoff Instructions

## Overview
A complete Meeting Presentation Builder system that allows users to:
1. Select a presentation template (Executive, Board Meeting, Team Huddle)
2. Add meeting details (title, date, time, notes)
3. Attach scanned/uploaded documents to the presentation
4. Add attendee emails and names
5. Generate a shareable slideshow-style presentation with unique link
6. Email the presentation to all attendees via Resend API

This is a premium "Meeting Prep" feature ideal for B2B apps, CRM systems, or professional portfolio tools.

---

## Implementation Checklist

### 1. Database Schema (Drizzle ORM + PostgreSQL)

Add to your schema file:

```typescript
// ========================
// MEETING PRESENTATIONS
// ========================
export const meetingPresentations = pgTable(
  "meeting_presentations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    // Template selection
    templateType: varchar("template_type", { length: 50 }).notNull(), // 'executive', 'board', 'huddle'
    
    // Meeting details
    title: varchar("title", { length: 255 }).notNull(),
    meetingDate: varchar("meeting_date", { length: 20 }),
    meetingTime: varchar("meeting_time", { length: 20 }),
    notes: text("notes"),
    
    // Attached documents (array of document IDs from your document/scanning system)
    documentIds: text("document_ids").array().default([]),
    
    // Attendees
    attendeeEmails: text("attendee_emails").array().default([]),
    attendeeNames: text("attendee_names").array().default([]),
    
    // Shareable link (unique slug for public viewing)
    shareableLink: varchar("shareable_link", { length: 100 }).unique(),
    
    // Status tracking
    status: varchar("status", { length: 20 }).default("draft"), // 'draft', 'ready', 'sent'
    sentAt: timestamp("sent_at"),
    viewCount: integer("view_count").default(0),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_meeting_presentations_user").on(table.userId),
    statusIdx: index("idx_meeting_presentations_status").on(table.status),
  })
);

export const insertMeetingPresentationSchema = createInsertSchema(meetingPresentations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  sentAt: true,
});
export type InsertMeetingPresentation = z.infer<typeof insertMeetingPresentationSchema>;
export type MeetingPresentation = typeof meetingPresentations.$inferSelect;

// Template definitions
export const PRESENTATION_TEMPLATES = [
  { id: 'executive', name: 'Executive Summary', description: 'Clean, minimal layout with company branding' },
  { id: 'board', name: 'Board Meeting', description: 'Formal structure with agenda and document sections' },
  { id: 'huddle', name: 'Team Huddle', description: 'Casual, friendly format for quick syncs' },
] as const;
```

After adding schema, run: `npx drizzle-kit push`

---

### 2. Storage Interface Methods

Add to your storage interface (`IStorage`):

```typescript
// Meeting Presentations
createMeetingPresentation(data: InsertMeetingPresentation): Promise<MeetingPresentation>;
getMeetingPresentations(userId: string): Promise<MeetingPresentation[]>;
getMeetingPresentation(id: string): Promise<MeetingPresentation | undefined>;
getMeetingPresentationByLink(shareableLink: string): Promise<MeetingPresentation | undefined>;
updateMeetingPresentation(id: string, data: Partial<InsertMeetingPresentation>): Promise<MeetingPresentation | undefined>;
deleteMeetingPresentation(id: string): Promise<boolean>;
incrementPresentationViewCount(id: string): Promise<void>;
markPresentationSent(id: string): Promise<void>;
```

Implementation:

```typescript
async createMeetingPresentation(data: InsertMeetingPresentation): Promise<MeetingPresentation> {
  const [presentation] = await db.insert(meetingPresentations).values(data).returning();
  return presentation;
}

async getMeetingPresentations(userId: string): Promise<MeetingPresentation[]> {
  return await db
    .select()
    .from(meetingPresentations)
    .where(eq(meetingPresentations.userId, userId))
    .orderBy(desc(meetingPresentations.createdAt));
}

async getMeetingPresentation(id: string): Promise<MeetingPresentation | undefined> {
  const [presentation] = await db.select().from(meetingPresentations).where(eq(meetingPresentations.id, id));
  return presentation;
}

async getMeetingPresentationByLink(shareableLink: string): Promise<MeetingPresentation | undefined> {
  const [presentation] = await db.select().from(meetingPresentations).where(eq(meetingPresentations.shareableLink, shareableLink));
  return presentation;
}

async updateMeetingPresentation(id: string, data: Partial<InsertMeetingPresentation>): Promise<MeetingPresentation | undefined> {
  const [presentation] = await db
    .update(meetingPresentations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(meetingPresentations.id, id))
    .returning();
  return presentation;
}

async deleteMeetingPresentation(id: string): Promise<boolean> {
  const result = await db.delete(meetingPresentations).where(eq(meetingPresentations.id, id));
  return result.rowCount > 0;
}

async incrementPresentationViewCount(id: string): Promise<void> {
  await db
    .update(meetingPresentations)
    .set({ viewCount: sql`${meetingPresentations.viewCount} + 1` })
    .where(eq(meetingPresentations.id, id));
}

async markPresentationSent(id: string): Promise<void> {
  await db
    .update(meetingPresentations)
    .set({ status: 'sent', sentAt: new Date() })
    .where(eq(meetingPresentations.id, id));
}
```

---

### 3. API Routes

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Get all presentations for user
app.get("/api/meeting-presentations", async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "userId required" });
  
  const presentations = await storage.getMeetingPresentations(userId);
  res.json(presentations);
});

// Get single presentation by ID
app.get("/api/meeting-presentations/:id", async (req, res) => {
  const presentation = await storage.getMeetingPresentation(req.params.id);
  if (!presentation) return res.status(404).json({ error: "Not found" });
  res.json(presentation);
});

// Get presentation by shareable link (public endpoint for viewer)
app.get("/api/meeting-presentations/link/:link", async (req, res) => {
  const presentation = await storage.getMeetingPresentationByLink(req.params.link);
  if (!presentation) return res.status(404).json({ error: "Not found" });
  
  // Increment view count
  await storage.incrementPresentationViewCount(presentation.id);
  res.json(presentation);
});

// Create new presentation
app.post("/api/meeting-presentations", async (req, res) => {
  const data = insertMeetingPresentationSchema.parse(req.body);
  const presentation = await storage.createMeetingPresentation(data);
  res.status(201).json(presentation);
});

// Update presentation
app.patch("/api/meeting-presentations/:id", async (req, res) => {
  const presentation = await storage.updateMeetingPresentation(req.params.id, req.body);
  if (!presentation) return res.status(404).json({ error: "Not found" });
  res.json(presentation);
});

// Delete presentation
app.delete("/api/meeting-presentations/:id", async (req, res) => {
  const success = await storage.deleteMeetingPresentation(req.params.id);
  if (!success) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

// Send presentation to attendees via email
app.post("/api/meeting-presentations/:id/send", async (req, res) => {
  const presentation = await storage.getMeetingPresentation(req.params.id);
  if (!presentation) return res.status(404).json({ error: "Not found" });
  
  if (!presentation.shareableLink) {
    return res.status(400).json({ error: "No shareable link generated" });
  }
  
  const attendeeEmails = presentation.attendeeEmails || [];
  if (attendeeEmails.length === 0) {
    return res.status(400).json({ error: "No attendees to send to" });
  }
  
  const template = PRESENTATION_TEMPLATES.find(t => t.id === presentation.templateType);
  const viewerUrl = `${process.env.APP_URL || 'https://yourapp.com'}/presentation/${presentation.shareableLink}`;
  
  try {
    await resend.emails.send({
      from: 'Your App <notifications@yourdomain.com>',
      to: attendeeEmails,
      subject: `Meeting Presentation: ${presentation.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're Invited to View a Presentation</h1>
          <h2 style="color: #666;">${presentation.title}</h2>
          <p><strong>Template:</strong> ${template?.name || 'Custom'}</p>
          ${presentation.meetingDate ? `<p><strong>Meeting Date:</strong> ${presentation.meetingDate} ${presentation.meetingTime || ''}</p>` : ''}
          ${presentation.notes ? `<p><strong>Notes:</strong> ${presentation.notes}</p>` : ''}
          <a href="${viewerUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Presentation
          </a>
          <p style="color: #999; margin-top: 30px; font-size: 12px;">
            This presentation was shared with you via [Your App Name].
          </p>
        </div>
      `,
    });
    
    await storage.markPresentationSent(presentation.id);
    res.json({ success: true, sentTo: attendeeEmails.length });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: "Failed to send emails" });
  }
});

// Get presentation templates
app.get("/api/presentation-templates", (req, res) => {
  res.json(PRESENTATION_TEMPLATES);
});
```

---

### 4. Frontend Pages

#### A. Builder Page (`/meeting-presentations`)

Create a 4-step wizard:

**Step 1: Template Selection**
- Display 3 template cards with icons and descriptions
- User selects one template type

**Step 2: Meeting Details**
- Title (required)
- Date picker
- Time picker
- Notes/agenda textarea

**Step 3: Document Selection**
- List scanned/uploaded documents from user's document library
- Checkboxes to select which documents to include
- Preview thumbnails if available

**Step 4: Attendees**
- Add attendee name + email pairs
- Validate email format
- Allow multiple attendees

**Final Actions:**
- Generate shareable link (random slug)
- Save presentation
- Option to send immediately or save as draft

#### B. Viewer Page (`/presentation/:link`)

Slideshow-style viewer features:
- Fetch presentation by shareable link
- Display slides based on template theme:
  - **Executive**: Dark gradient, minimal, professional
  - **Board Meeting**: Navy/formal, structured sections
  - **Team Huddle**: Warm/casual, friendly colors
- Navigation: Arrow keys, swipe, or buttons
- Fullscreen toggle
- Slide counter (e.g., "3 of 7")
- View count display
- Each attached document becomes a slide

---

### 5. Route Registration

Add to your App.tsx or router:

```typescript
import MeetingPresentations from "./pages/meeting-presentations";
import PresentationViewer from "./pages/presentation-viewer";

// In your routes:
<Route path="/meeting-presentations" component={MeetingPresentations} />
<Route path="/presentation/:link" component={PresentationViewer} />
```

---

### 6. Quick Action Integration

Add a button/link in your CRM/Portfolio/Dashboard to access the Meeting Presentations builder:

```tsx
<Link href="/meeting-presentations">
  <Button>
    <Presentation className="h-5 w-5" />
    <span>Presentations</span>
  </Button>
</Link>
```

---

## Environment Variables Required

```
RESEND_API_KEY=re_xxxxxx
APP_URL=https://yourapp.com  (for email links)
```

---

## Customization Points

1. **Template Themes**: Adjust colors/gradients in the viewer to match your app's design system
2. **Email Branding**: Customize the Resend email HTML template with your logo and colors
3. **Document Integration**: Connect to your existing document/file upload system
4. **User Authentication**: Ensure userId comes from your auth system
5. **App Domain**: Update email "from" address and APP_URL for your domain

---

## File Structure

```
shared/
  schema.ts          # Add meetingPresentations table + types

server/
  storage.ts         # Add IStorage methods + implementations
  routes.ts          # Add API endpoints

client/src/pages/
  meeting-presentations.tsx   # Builder wizard
  presentation-viewer.tsx     # Slideshow viewer

client/src/App.tsx   # Register routes
```

---

## Testing Checklist

- [ ] Create presentation with each template type
- [ ] Add multiple documents
- [ ] Add multiple attendees
- [ ] Generate shareable link
- [ ] View presentation via link (unauthenticated)
- [ ] Send email to attendees
- [ ] Verify view count increments
- [ ] Delete presentation

---

*Generated from Brew & Board Coffee implementation - v1.1.7*
