const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

// Schemas
const VideoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General", index: true },
    duration: { type: String, default: "15:00" },
    thumbnailUrl: { type: String, required: true },
    date: { type: String, required: true },
    publishedAt: { type: String },
    views: { type: Number, default: 0 },
    viewsText: { type: String },
    tags: [{ type: String }],
    difficulty: { type: String, default: "Intermediate" },
    featured: { type: Boolean, default: false },
    episode: { type: Number },
    playlistId: { type: String, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PlaylistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Admin" },
    level: { type: String, default: "Beginner to Advanced" },
    totalEpisodes: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    videoIds: [{ type: String }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

const NoteSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    content: { type: String, required: true },
    codeSnippet: { type: String },
    language: { type: String, default: "apex" },
    keyTakeaways: [{ type: String }],
  },
  { _id: false }
);

const NoteDocSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    readTime: { type: String, default: "12 min read" },
    updatedAt: { type: String, required: true },
    badge: { type: String, default: "Architecture Guide" },
    difficulty: { type: String, default: "Intermediate" },
    sections: [NoteSectionSchema],
    pdfUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProfileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Sachin Singh" },
    title: { type: String, default: "Salesforce Specialist & Content Creator at SacWac" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "https://www.youtube.com/@SachinSingh-n2g7t" },
    linkedinUrl: { type: String, default: "https://www.linkedin.com/in/sachin-singh-040290218/" },
    topmateUrl: { type: String, default: "https://topmate.io/sacwac" },
    email: { type: String, default: "sacwacsalesforce@gmail.com" },
    workEmail: { type: String, default: "sacwac.work@gmail.com" },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);
const Playlist = mongoose.model("Playlist", PlaylistSchema);
const NoteDoc = mongoose.model("NoteDoc", NoteDocSchema);
const Profile = mongoose.model("Profile", ProfileSchema);

// Genuine, in-depth architectural study notes for Salesforce Administrator
const GENUINE_ADMIN_NOTES = [
  {
    id: "admin-note-01",
    title: "Salesforce Architecture, Multi-Tenancy & Governor Limits Deep-Dive",
    category: "Admin",
    summary: "The definitive enterprise guide to Salesforce multi-tenant cloud architecture, metadata-driven runtime engine, infrastructure tiers, and why Governor Limits exist.",
    readTime: "14 min read",
    updatedAt: "Nov 10, 2026",
    badge: "ADM-201 Core Foundation",
    difficulty: "Beginner",
    isFeatured: true,
    sections: [
      {
        heading: "1. Understanding Multi-Tenant Architecture vs Single-Tenant Infrastructure",
        content: `In traditional enterprise software (single-tenant), each customer has dedicated servers, dedicated databases, and dedicated operating systems. If an application needs an upgrade or patch, engineers must update each customer environment separately.

Salesforce operates on a **True Multi-Tenant Cloud Architecture**:
- All customers (tenants), from startups to Fortune 500 enterprises, share the exact same physical computing infrastructure, database cluster, and application code simultaneously.
- **Data Isolation Guarantee**: How does tenant A not see tenant B's data? The Salesforce runtime engine strictly injects an immutable 15/18-character Organization ID (Org ID) into every single SQL query executed under the hood at the Oracle/Postgres database layer.
- **Automatic Upgrades**: 3 times a year (Spring, Summer, Winter), Salesforce upgrades the platform core with zero customer downtime and 100% backward compatibility for custom metadata.`,
        keyTakeaways: [
          "Multi-tenancy enables shared costs, seamless tri-annual upgrades, and high availability.",
          "Every database query automatically appends WHERE organization_id = :currentOrgId at the kernel layer.",
          "Customer customizations are saved strictly as metadata records, never hardcoded server modifications."
        ]
      },
      {
        heading: "2. The Metadata Architecture & Universal Data Dictionary",
        content: `Salesforce separates code/configuration from data using a sophisticated metadata abstraction layer:

1. **Data**: The actual rows representing customer records (Accounts, Contacts, Custom Object records).
2. **Metadata**: The structural definition of how data is shaped (Object definitions, Page Layouts, Apex Triggers, Flow XML, Field Security).
3. **Runtime Engine**: When an end-user navigates to an Account record, the runtime engine looks up the user's Profile/Permission Sets, dynamically compiles the Page Layout metadata, runs FLS checks, pulls the record row, and renders the Lightning UI in milliseconds.

Because customizations are stored as XML metadata, updating a picklist, adding a validation rule, or deploying an Apex class never alters the underlying database schema directly.`,
        keyTakeaways: [
          "Metadata allows Salesforce to decouple configuration from the underlying database engine.",
          "Custom fields, objects, and validation rules are compiled dynamically on-demand at runtime."
        ]
      },
      {
        heading: "3. Governor Limits: Why They Exist and Architectural Best Practices",
        content: `Because computing resources (CPU time, heap memory, database connection pools) are shared among tenants on an instance, Governor Limits prevent any single poorly written script or automation from monopolizing resources and degrading performance for other organizations.

Key Administrator & Developer Governor Limits to master:
- **SOQL Queries per transaction**: 100 queries (Synchronous) / 200 queries (Asynchronous).
- **Total records retrieved by SOQL**: 50,000 records per transaction.
- **DML statements per transaction**: 150 statements (Insert, Update, Delete).
- **Total records processed by DML**: 10,000 records.
- **CPU Time Limit**: 10,000 milliseconds (Synchronous) / 60,000 milliseconds (Asynchronous).

**Best Practice Rule of Thumb**: Never execute a query or DML inside a loop (whether in Apex or Flow loops). Always bulkify operations by collecting records into a List or Map before persisting.`,
        codeSnippet: `// ❌ VIOLATION: DML inside a loop (Hits 150 DML limit immediately)
for (Contact c : contactList) {
    c.Description = 'Updated';
    update c; 
}

// ✅ BULKIFIED BEST PRACTICE: Single DML statement processing entire collection
List<Contact> toUpdate = new List<Contact>();
for (Contact c : contactList) {
    c.Description = 'Updated via Bulkified Pattern';
    toUpdate.add(c);
}
if (!toUpdate.isEmpty()) {
    update toUpdate; // 1 DML statement consumed
}`,
        language: "apex",
        keyTakeaways: [
          "Governor limits protect system integrity in a multi-tenant ecosystem.",
          "Always design automations (Flows & Apex) to handle 200 records in bulk batches."
        ]
      }
    ]
  },
  {
    id: "admin-note-02",
    title: "Salesforce Data Modeling: Objects, Relationships & Schema Architecture",
    category: "Admin",
    summary: "Deep architectural comparison between Standard vs Custom Objects, Lookup vs Master-Detail relationships, Junction Objects, and Roll-Up Summary performance.",
    readTime: "15 min read",
    updatedAt: "Nov 10, 2026",
    badge: "Enterprise Architecture",
    difficulty: "Intermediate",
    isFeatured: true,
    sections: [
      {
        heading: "1. Standard Objects vs Custom Objects Anatomy",
        content: `Salesforce provides out-of-the-box business objects designed to mirror the end-to-end customer lifecycle:
- **Lead**: An unqualified prospect (top of the funnel).
- **Account**: An organization, vendor, partner, or person with whom you conduct business.
- **Contact**: An individual person associated with an Account.
- **Opportunity**: A qualified deal or revenue-generating event with defined Stages, Amount, and Close Date.
- **Case**: A customer service issue or ticket.

**Custom Objects** (suffixed with \`__c\`):
Created when standard objects do not fit the business domain (e.g., \`Property__c\`, \`Policy__c\`, \`Subscription__c\`). Every custom object automatically receives standard system fields: \`Id\`, \`Name\`, \`CreatedById\`, \`CreatedDate\`, \`LastModifiedById\`, \`LastModifiedDate\`, \`OwnerId\` (unless master-detail), and \`SystemModstamp\`.`,
        keyTakeaways: [
          "Always prefer using standard objects before creating custom objects to leverage built-in platform features.",
          "Record IDs are 15 characters (case-sensitive, used in UI) and 18 characters (case-safe, used in APIs & reports)."
        ]
      },
      {
        heading: "2. Lookup vs. Master-Detail Relationships: Comprehensive Technical Matrix",
        content: `Choosing between a Lookup and a Master-Detail relationship is one of the most critical architectural decisions in Salesforce:

| Architectural Feature | Lookup Relationship (\`Lookup\`) | Master-Detail Relationship (\`Master-Detail\`) |
| :--- | :--- | :--- |
| **Parent Requirement** | Optional by default (can be made required via checkbox). | **Strictly Required**. A child record cannot exist without a parent. |
| **Cascade Delete** | Parent deletion DOES NOT delete child records (clears lookup or prevents delete). | **Cascade Delete Enabled**. Deleting the master automatically deletes all detail records. |
| **Security & Ownership** | Child records have their own \`OwnerId\` and independent sharing rules. | **Inherited Security**. Child has no Owner field; security is controlled 100% by parent. |
| **Roll-Up Summary Fields** | Not supported natively without Flows or Apex triggers. | **Supported Natively**. Master can calculate COUNT, SUM, MIN, MAX on child fields. |
| **Reparenting** | Allowed freely. | Not allowed by default, unless "Allow Reparenting" checkbox is explicitly enabled. |
| **Max Limits per Object** | Up to 40 lookups per object. | Maximum of **2 Master-Detail relationships** per object. |`,
        keyTakeaways: [
          "Use Master-Detail when the child has no independent existence and requires roll-up summaries on the master.",
          "Never convert a Lookup to Master-Detail in production without first populating the lookup on every existing child record."
        ]
      },
      {
        heading: "3. Many-to-Many Relationships & Junction Objects",
        content: `When a business scenario requires a Many-to-Many relationship (e.g., A Student can enroll in Many Courses, and a Course can have Many Students):

**Solution**: Create a custom **Junction Object** with TWO Master-Detail relationship fields.
- Example: \`Enrollment__c\` links \`Student__c\` and \`Course__c\`.
- **Primary Master**: The first Master-Detail relationship defined controls the look-and-feel of the detail page, ownership color, and default icon.
- **Deletion Behavior**: Deleting either the Student or the Course automatically deletes the corresponding Enrollment record via cascade delete.`,
        keyTakeaways: [
          "A Junction Object models Many-to-Many relationships using two Master-Detail fields.",
          "The first created Master-Detail relationship designates the Primary Master."
        ]
      }
    ]
  },
  {
    id: "admin-note-03",
    title: "Salesforce Security Architecture: The 4 Defense Layers Deep-Dive",
    category: "Security",
    summary: "The definitive enterprise guide to Org-Level, Object-Level (CRUD), Field-Level (FLS), and Record-Level (OWD, Role Hierarchy, Sharing Rules, Restriction Rules) security.",
    readTime: "18 min read",
    updatedAt: "Nov 10, 2026",
    badge: "Security Architecture",
    difficulty: "Advanced",
    isFeatured: true,
    sections: [
      {
        heading: "1. The 4 Security Layers Overview",
        content: `Salesforce utilizes a layered security model often visualized as concentric gates:

1. **Layer 1: Organization Level (The Front Gate)**: "Can this person enter the system?" Controlled via Username/Password, Multi-Factor Authentication (MFA), Login IP Ranges, and Login Hours.
2. **Layer 2: Object Level (The Room Door)**: "What objects can this user see or modify?" Controlled via Profiles and Permission Sets (CRUD: Create, Read, Edit, Delete).
3. **Layer 3: Field Level (The Cabinet)**: "Which fields on that object can this user inspect or edit?" Controlled via Field-Level Security (FLS: Visible / Read-Only).
4. **Layer 4: Record Level (The Individual Folders)**: "Which specific record rows can this user access?" Controlled via OWD, Role Hierarchy, Sharing Rules, Manual Sharing, and Restriction Rules.`,
        keyTakeaways: [
          "Always remember: Object-level permissions control WHICH TYPES of records you can touch; Record-level controls WHICH SPECIFIC RECORDS you can view.",
          "FLS overrides Page Layout settings. If a field is hidden via FLS, the user cannot access it via Reports, APIs, or UI."
        ]
      },
      {
        heading: "2. Record-Level Security Architecture & The Sharing Pipeline",
        content: `Salesforce evaluates record access sequentially through the sharing pipeline:

1. **Organization-Wide Defaults (OWD)**: The baseline access level across the entire company for users who do not own the record.
   - **Private**: Only record owner and users above them in the Role Hierarchy can view/edit.
   - **Public Read Only**: Everyone can view; only owner can edit.
   - **Public Read/Write**: Everyone can view and edit.
   - **Controlled by Parent**: Used strictly for child objects in Master-Detail relationships.
2. **Role Hierarchy**: Automatically opens vertical access upwards. Managers inherit the same permissions as their subordinates on records owned by subordinates (unless "Grant Access Using Hierarchies" is disabled on custom objects).
3. **Sharing Rules**: Used to grant horizontal access across department silos to Public Groups or Roles:
   - **Owner-Based Sharing**: Records owned by Sales Reps shared Read/Write with Marketing Team.
   - **Criteria-Based Sharing**: Records where \`Status__c = 'Escalated'\` shared automatically with Tier 2 Support.
4. **Manual Sharing**: Allows record owners to manually share an individual record with a specific colleague for collaboration.
5. **Restriction Rules**: The newest and most powerful security feature. Unlike sharing rules which only OPEN access, Restriction Rules **RESTRICT** access by filtering down visible records based on specific criteria.`,
        keyTakeaways: [
          "OWD is the ONLY place where you restrict baseline access. All subsequent sharing mechanisms (Hierarchy, Sharing Rules) only OPEN access wider.",
          "Restriction Rules run after sharing evaluation to enforce strict compliance and sensitivity filters."
        ]
      }
    ]
  },
  {
    id: "admin-note-04",
    title: "Dynamic Forms, Record Types & Lightning App Builder Mastery",
    category: "Admin",
    summary: "Architectural blueprint for transitioning legacy page layouts to Dynamic Forms, component visibility filtering, and multi-persona UI delivery.",
    readTime: "12 min read",
    updatedAt: "Nov 10, 2026",
    badge: "Modern Lightning UI",
    difficulty: "Intermediate",
    isFeatured: false,
    sections: [
      {
        heading: "1. Why Dynamic Forms Replaces Traditional Page Layouts",
        content: `For over 15 years, Salesforce Administrators had to manage dozens of separate Page Layouts and Record Types just to show or hide fields for different business roles or stages:
- **Traditional Page Layout Pain Points**: Massive layouts with 100+ fields, slow page load times, inability to conditionally hide individual fields based on field values, and maintenance nightmares when adding a single field across 15 layouts.
- **Dynamic Forms Solution**: Breaks monolithic page layouts into individual Field and Field Section components directly inside the Lightning App Builder.
- **Component Visibility Filters**: Admins can now conditionally show or hide a field section or individual field based on record values (e.g., Show \`Reason_for_Loss__c\` ONLY when \`StageName = 'Closed Lost'\`) or user persona (e.g., Show \`Commission_Rate__c\` ONLY to \`$User.Profile.Name = 'Sales Director'\`).`,
        keyTakeaways: [
          "Dynamic Forms improves page load speed by only querying and rendering active components.",
          "Significantly reduces the need to create duplicate page layouts and record types."
        ]
      },
      {
        heading: "2. Record Types Architecture & Picklist Matrix",
        content: `Record Types serve two primary purposes in Salesforce:
1. **Assigning Different Page Layouts / Lightning Pages** to different user personas or business operations.
2. **Filtering Available Picklist Values**: For example, an Opportunity record of type "Enterprise Software" might offer Sales Stages 1 through 7, whereas a "Professional Services" record type might only offer Stages 1 through 4.

**Crucial Exam Concept**: Record Types do NOT control record security or CRUD permissions! Record Types only control picklist values and layout assignments. Security is handled by Profiles, Permission Sets, and OWD.`,
        keyTakeaways: [
          "Record Types filter picklist values and map page layouts.",
          "Never confuse Record Types with Security Access."
        ]
      }
    ]
  },
  {
    id: "admin-note-05",
    title: "Enterprise Automation: Web-to-Lead, Case Pipelines & Approval Engines",
    category: "Admin",
    summary: "Comprehensive guide to Web-to-Lead, Case queues, Email-to-Case routing, Assignment Rules, and multi-step Approval Processes.",
    readTime: "16 min read",
    updatedAt: "Nov 10, 2026",
    badge: "Business Automation",
    difficulty: "Advanced",
    isFeatured: true,
    sections: [
      {
        heading: "1. Web-to-Lead and Web-to-Case Pipeline Architecture",
        content: `Salesforce provides out-of-the-box endpoints to capture prospect leads and support tickets directly from websites without middleware:
- **Web-to-Lead Limit**: 500 leads per 24-hour rolling window. Excess leads are queued and emailed to the default lead creator.
- **reCAPTCHA v2/v3 Integration**: Essential to prevent spam bot submissions from flooding your org with fake Lead records.
- **Lead Assignment Rules**: Automatically evaluates incoming leads based on criteria (e.g., \`Country = 'India'\` -> Assign to APAC Sales Queue; \`Country = 'USA'\` -> Assign to North America Sales Team).
- **Auto-Response Rules**: Sends immediate, personalized confirmation emails to the submitter using custom HTML email templates.`,
        keyTakeaways: [
          "Only ONE Assignment Rule and ONE Auto-Response Rule can be active at a time per object.",
          "Assignment rule entries evaluate in sequential order (1, 2, 3...) and stop evaluating upon the first true match."
        ]
      },
      {
        heading: "2. Multi-Step Approval Processes & Executive Routing",
        content: `Approval processes automate the formal approval and sign-off workflow for records requiring authorization (e.g., Discount requests > 20%, Expense claims, Time-off):

**Lifecycle of an Approval Process**:
1. **Entry Criteria**: When is a record eligible? (e.g., \`Opportunity.Discount_Percentage__c > 0.15\`).
2. **Initial Submission Actions**: What happens immediately when user clicks 'Submit for Approval'?
   - Record is locked from editing.
   - Field update: \`Approval_Status__c = 'Pending'\`.
   - Email alert sent to direct manager.
3. **Approval Steps**: Sequential or parallel steps with delegated approvers:
   - **Unanimous vs First Response**: For multi-user approval, requires either all approvers or the first approver to decide.
4. **Final Approval Actions**: Record unlocked, \`Discount_Approved__c = True\`, notification sent.
5. **Final Rejection Actions**: Record unlocked, \`Approval_Status__c = 'Rejected'\`.
6. **Recall Actions**: Allows submitter to recall the request if mistakes were made before decision was rendered.`,
        keyTakeaways: [
          "Record locking ensures data integrity while an approval decision is pending.",
          "Field updates inside approval processes can trigger workflow rules and automations."
        ]
      }
    ]
  }
];

async function runMigration() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to database 'sacwac'!");

    // 1. Seed Videos
    const videosFilePath = path.join(process.cwd(), "src", "data", "videos.json");
    if (fs.existsSync(videosFilePath)) {
      const rawVideos = JSON.parse(fs.readFileSync(videosFilePath, "utf8"));
      console.log(`Migrating ${rawVideos.length} videos into MongoDB...`);

      const videoIdToMongoIdMap = new Map();

      for (let i = 0; i < rawVideos.length; i++) {
        const v = rawVideos[i];
        const doc = await Video.findOneAndUpdate(
          { id: v.id },
          {
            ...v,
            order: i,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        videoIdToMongoIdMap.set(v.id, doc._id);
        videoIdToMongoIdMap.set(v.youtubeId, doc._id);
      }
      console.log(`Successfully migrated ${rawVideos.length} videos to MongoDB!`);

      // 2. Seed Playlists with ObjectIds
      const playlistsFilePath = path.join(process.cwd(), "src", "data", "playlists.json");
      if (fs.existsSync(playlistsFilePath)) {
        const rawPlaylists = JSON.parse(fs.readFileSync(playlistsFilePath, "utf8"));
        console.log(`Migrating ${rawPlaylists.length} playlists with video ObjectId references...`);

        for (const pl of rawPlaylists) {
          const resolvedObjectIds = [];
          if (Array.isArray(pl.videoIds)) {
            for (const vId of pl.videoIds) {
              const mongoId = videoIdToMongoIdMap.get(vId);
              if (mongoId) {
                resolvedObjectIds.push(mongoId);
              }
            }
          }

          await Playlist.findOneAndUpdate(
            { id: pl.id },
            {
              ...pl,
              videos: resolvedObjectIds,
              totalEpisodes: resolvedObjectIds.length || (pl.videoIds ? pl.videoIds.length : 0),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        console.log(`Successfully migrated ${rawPlaylists.length} playlists to MongoDB!`);
      }
    }

    // 3. Seed Profile
    const profileFilePath = path.join(process.cwd(), "src", "data", "profile.json");
    if (fs.existsSync(profileFilePath)) {
      const rawProfile = JSON.parse(fs.readFileSync(profileFilePath, "utf8"));
      console.log("Migrating creator profile into MongoDB...");
      await Profile.findOneAndUpdate(
        {},
        rawProfile,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log("Successfully migrated creator profile to MongoDB!");
    }

    // 4. Seed Notes (including Existing Notes + New Genuine Admin Notes)
    const existingNotesPath = path.join(process.cwd(), "src", "data", "notes.json");
    let allNotes = [];
    if (fs.existsSync(existingNotesPath)) {
      const existing = JSON.parse(fs.readFileSync(existingNotesPath, "utf8"));
      allNotes = [...existing];
    }

    // Merge in the genuine in-depth notes
    for (const newNote of GENUINE_ADMIN_NOTES) {
      const idx = allNotes.findIndex((n) => n.id === newNote.id);
      if (idx !== -1) {
        allNotes[idx] = newNote;
      } else {
        allNotes.push(newNote);
      }
    }

    console.log(`Migrating ${allNotes.length} genuine high-depth study notes into MongoDB...`);
    for (let i = 0; i < allNotes.length; i++) {
      const n = allNotes[i];
      await NoteDoc.findOneAndUpdate(
        { id: n.id },
        { ...n, order: i },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Successfully migrated ${allNotes.length} notes into MongoDB!`);

    // Also persist allNotes back to src/data/notes.json as local fallback
    fs.writeFileSync(existingNotesPath, JSON.stringify(allNotes, null, 2), "utf8");
    console.log("Local notes.json fallback synchronized!");

    console.log("Database migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigration();
