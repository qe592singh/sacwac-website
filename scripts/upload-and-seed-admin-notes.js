const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

cloudinary.config({
  cloud_name: "posrp1og",
  api_key: "635927884763466",
  api_secret: "kcbrrYGz1D_0RFrLnw-L4YkRlDE",
  secure: true,
});

const NOTES_FOLDER = "C:/Users/sachi/Desktop/My Videos/Admin Course/Admin Course Notes";

// Mongoose Schemas
const VideoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Admin" },
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
    playlistId: { type: String },
    order: { type: Number, default: 0 },
    noteId: { type: String },
    hasNotes: { type: Boolean, default: false },
    notesContent: { type: String },
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
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: "Admin" },
    summary: { type: String, required: true },
    readTime: { type: String, default: "12 min read" },
    updatedAt: { type: String, required: true },
    badge: { type: String, default: "Admin Course Note" },
    difficulty: { type: String, default: "Intermediate" },
    sections: [NoteSectionSchema],
    pdfUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    episode: { type: Number },
    videoId: { type: String },
    rawContent: { type: String },
  },
  { timestamps: true }
);

const VideoModel = mongoose.models.Video || mongoose.model("Video", VideoSchema);
const NoteModel = mongoose.models.NoteDoc || mongoose.model("NoteDoc", NoteDocSchema);

// EPISODE METADATA & COMPREHENSIVE CURRICULUM DEFINITION
const EPISODE_DATA = [
  {
    ep: 1,
    title: "Introduction to CRM, Cloud Computing & Salesforce Multi-Tenant Architecture",
    badge: "Module 1 • Ep 1",
    readTime: "12 min read",
    difficulty: "Beginner",
    summary: "Complete breakdown of Cloud Computing models (IaaS, PaaS, SaaS), Salesforce multi-tenancy runtime architecture, metadata-driven platform layers, and the core CRM ecosystem.",
    sections: [
      {
        heading: "1. What is CRM and Cloud Computing Architecture?",
        content: `Customer Relationship Management (CRM) is a strategic enterprise platform designed to manage and optimize all organizational interactions with current and potential customers across marketing, sales, commerce, and service.\n\nCloud Computing delivers computing services (servers, storage, databases, networking, software) over the Internet ('the cloud') with flexible resources and economies of scale:\n• IaaS (Infrastructure as a Service): Raw compute/storage (e.g., AWS EC2, Google Compute Engine).\n• PaaS (Platform as a Service): Hardware and software development tools hosted on the cloud (e.g., Salesforce Lightning Platform, Heroku).\n• SaaS (Software as a Service): Complete, vendor-managed application delivered via web browser (e.g., Salesforce Sales Cloud, Gmail).`,
        keyTakeaways: [
          "Salesforce is both SaaS (ready-to-use apps) and PaaS (custom objects, automation, Apex).",
          "Multi-tenant architecture means multiple customers share shared database infrastructure securely partitioned by Org IDs.",
        ],
      },
      {
        heading: "2. Salesforce Multi-Tenancy & The Metadata-Driven Model",
        content: `In Salesforce's multi-tenant architecture, all customers share the exact same hardware, runtime execution engine, and database schema, yet each tenant's data and custom code are completely isolated.\n\nEvery custom field, custom object, page layout, and validation rule created by an administrator is stored not as physical database table definitions, but as METADATA. At runtime, the Salesforce Universal Data Dictionary combines system metadata, tenant custom metadata, and data rows into virtual views on the fly.`,
        codeSnippet: `// Concept: How Salesforce separates Tenant Data from Platform Core
SELECT OrgId, UserId, EntityDefinition.DeveloperName, FieldDefinition.QualifiedApiName
FROM CustomField
WHERE EntityDefinition.DeveloperName = 'Invoice__c'`,
        language: "sql",
        keyTakeaways: [
          "Metadata defines the structure; Data defines the records.",
          "Governor limits exist directly because of multi-tenancy to ensure no single tenant monopolizes shared CPU or DB resources.",
        ],
      },
    ],
  },
  {
    ep: 2,
    title: "Salesforce Objects: Standard vs. Custom Objects & Object Manager Mastery",
    badge: "Module 1 • Ep 2",
    readTime: "14 min read",
    difficulty: "Beginner",
    summary: "Deep dive into database tables in Salesforce: Standard Objects (Account, Contact, Lead, Opportunity), Custom Objects (__c), System Audit Fields, and Object Manager navigation.",
    sections: [
      {
        heading: "1. Salesforce Objects as Relational Database Tables",
        content: `An Object in Salesforce is the equivalent of a table in a relational database. It represents a specific business entity (such as Companies, People, Support Cases, or custom entities like Project or Invoices).\n\n• Standard Objects: Built-in objects provided out-of-the-box by Salesforce to support core business processes (e.g., Lead, Account, Contact, Opportunity, Case).\n• Custom Objects: Created by administrators or developers to store information unique to an organization's specific business needs. Every custom object API name ends with '__c'.`,
        keyTakeaways: [
          "Standard objects cannot be deleted and their API names do not end with '__c'.",
          "Custom objects automatically generate system audit fields upon creation.",
        ],
      },
      {
        heading: "2. System Audit Fields & Object Manager Capabilities",
        content: `Whenever any object is created in Salesforce, the platform automatically generates 4 un-editable System Audit Fields:\n1. CreatedById (User who created the record)\n2. CreatedDate (Timestamp of creation)\n3. LastModifiedById (User who last edited)\n4. LastModifiedDate (Timestamp of last modification)\n\nAdditionally, standard objects and custom objects feature 'OwnerId' for record-level ownership unless controlled by a Master-Detail parent.`,
        codeSnippet: `// SOQL Query Demonstrating Object Query with Standard Audit Fields
SELECT Id, Name, CreatedDate, CreatedBy.Name, LastModifiedDate
FROM Project__c
ORDER BY CreatedDate DESC LIMIT 10`,
        language: "sql",
        keyTakeaways: [
          "Audit fields cannot be manually updated except during data migrations with special permissions ('Set Audit Fields on Record Creation').",
          "Object Manager allows configuring Fields, Page Layouts, Lightning Record Pages, Buttons, and Validation Rules in one consolidated place.",
        ],
      },
    ],
  },
  {
    ep: 3,
    title: "Salesforce Fields & Data Types: Field Architecture, Attributes & System Fields",
    badge: "Module 1 • Ep 3",
    readTime: "15 min read",
    difficulty: "Beginner",
    summary: "Comprehensive guide to standard and custom fields, data types (Text, Number, Currency, Date/Time, Checkbox, Auto-Number), field attributes (Unique, External ID), and storage considerations.",
    sections: [
      {
        heading: "1. Standard vs. Custom Fields Architecture",
        content: `Fields are the columns of a Salesforce object table. They hold the actual data values for individual records.\n\n• Standard Fields: Pre-built on standard objects (e.g., Account Name, Phone, Annual Revenue). While standard fields cannot be deleted or converted to custom types, their labels can often be renamed.\n• Custom Fields: Created by administrators on either standard or custom objects. Custom fields always end with the '__c' suffix in their API Name. Custom fields can be deleted (moved to Deleted Fields recycle bin for 15 days before permanent hard purge).`,
        keyTakeaways: [
          "Custom field API names always end with '__c' (e.g., Tax_Id__c).",
          "Changing field types in production can cause permanent data truncation; always backup data before type modifications.",
        ],
      },
      {
        heading: "2. Essential Data Types & Field Attributes",
        content: `Salesforce provides specialized data types designed for enterprise business workflows:\n• Auto-Number: Formatted alphanumeric sequence generated automatically (e.g., INV-{0000}).\n• Checkbox: True/False binary flag.\n• Currency: Numeric value formatted according to the user's or org's corporate currency.\n• Date vs Date/Time: Date stores date only; Date/Time stores UTC timestamp converted to user's localized timezone.\n• External ID: Marks a custom field as a unique record identifier from an external system (e.g., SAP, NetSuite, Oracle) to enable efficient upsert operations without prior Salesforce record IDs.\n• Unique: Prevents duplicate values across records (can be case-sensitive or case-insensitive).`,
        codeSnippet: `// Formula Example: Calculating Days Overdue
TODAY() - Due_Date__c`,
        language: "sql",
        keyTakeaways: [
          "You can have up to 25 External ID fields per custom object.",
          "Text fields marked as External ID are automatically indexed in the Salesforce database for rapid SOQL performance.",
        ],
      },
    ],
  },
  {
    ep: 4,
    title: "Picklist Fields in Salesforce: Standard, Multi-Select, Global Value Sets & Dependencies",
    badge: "Module 1 • Ep 4",
    readTime: "14 min read",
    difficulty: "Beginner",
    summary: "Mastering Single-Select, Multi-Select Picklists, Global Value Sets for org-wide data integrity, and Controlling vs. Dependent Picklist matrix configurations.",
    sections: [
      {
        heading: "1. Picklist Architecture: Standard vs. Custom vs. Global Value Sets",
        content: `A Picklist field provides users with a standardized menu of predefined options to ensure data consistency, eliminate spelling errors, and simplify reporting.\n\n• Custom Picklist: Values defined locally on a single object.\n• Global Value Set: A centralized, reusable set of picklist values that can be shared across multiple custom picklist fields on different objects. When you update or deactivate a value in a Global Value Set, the change immediately reflects across every field referencing that set.\n• Multi-Select Picklist: Allows users to choose one or more values. Values are stored in the database as a single semicolon-delimited string (e.g., 'Alpha;Beta;Gamma').`,
        keyTakeaways: [
          "Avoid multi-select picklists for primary reporting keys; they cannot be easily grouped or used in standard mathematical summaries.",
          "Use Global Value Sets whenever the same lookup options (e.g., Region, Industry, Tier) are needed across multiple objects.",
        ],
      },
      {
        heading: "2. Field Dependencies (Controlling vs. Dependent)",
        content: `Field dependencies allow administrators to filter the available options in a dependent picklist based on the value selected in a controlling field.\n\nSupported Controlling Fields:\n• Standard & Custom Single-Select Picklists\n• Checkbox fields (Checked = True, Unchecked = False)\n\nSupported Dependent Fields:\n• Custom Single-Select Picklists\n• Custom Multi-Select Picklists\n\n*Important:* Standard Picklist fields CANNOT be dependent fields; they can only act as controlling fields.`,
        codeSnippet: `// Example Dependency Matrix:
// Controlling: Country__c (USA, India, UK)
// Dependent: State_Province__c
// If Country = 'USA' -> [California, Texas, New York]
// If Country = 'India' -> [Maharashtra, Karnataka, Delhi]`,
        language: "text",
        keyTakeaways: [
          "Standard picklists cannot be dependent fields.",
          "Multi-select picklists cannot be controlling fields.",
        ],
      },
    ],
  },
  {
    ep: 5,
    title: "Formula Fields in Salesforce: Syntax, Functions, Cross-Object References & Compile Limits",
    badge: "Module 1 • Ep 5",
    readTime: "16 min read",
    difficulty: "Intermediate",
    summary: "Complete blueprint for read-only calculated formula fields, Cross-Object lookups, logical functions (IF, CASE, AND, OR), date math, and navigating 5,000-character compile limits.",
    sections: [
      {
        heading: "1. Formula Fields Architecture & Execution Context",
        content: `Formula fields are read-only fields whose values are calculated dynamically at the exact moment a record is viewed, queried, or processed by automation. Because formulas are evaluated in real-time, they do not consume physical data storage.\n\nSupported Formula Return Types:\n• Checkbox, Currency, Date, Date/Time, Number, Percent, Text, Time.\n\nCross-Object Formulas: Formulas can reference fields from up to 10 parent objects related via Lookups or Master-Detail relationships using dot-notation (e.g., 'Contact.Account.BillingCity').`,
        keyTakeaways: [
          "Formula values are never stored directly in the database table, unless marked as deterministic and indexed.",
          "You can navigate up to 10 relationships away from the base object in a cross-object formula.",
        ],
      },
      {
        heading: "2. Critical Formula Functions & Compile Size Troubleshooting",
        content: `Key Functions Every Salesforce Administrator Must Master:\n• CASE(): Streamlined multi-condition branching (faster and cleaner than nested IFs).\n• PRIORVALUE(): Available in validation rules and workflows to compare historical values.\n• ISBLANK() vs ISNULL(): Always use ISBLANK(); ISNULL does not support text fields.\n• IMAGE(): Display visual badges, flags, or stars based on criteria.\n\n*Governor Limit Alert:* A formula's compiled size cannot exceed 5,000 bytes. When hitting compile limits, break formulas into helper formula fields or push logic into Record-Triggered Flows.`,
        codeSnippet: `// Dynamic Priority Indicator Badge Formula
IMAGE(
  CASE( Priority,
    "High", "/img/samples/flag_red.gif",
    "Medium", "/img/samples/flag_yellow.gif",
    "Low", "/img/samples/flag_green.gif",
    "/s.gif"
  ),
  "Priority Indicator"
)`,
        language: "sql",
        keyTakeaways: [
          "Use CASE() instead of nested IF() statements to drastically reduce formula compile size.",
          "Formula fields are automatically updated on all dependent reports without needing record saves.",
        ],
      },
    ],
  },
];

// Helper to fill remaining episodes 6..39 dynamically with authentic curriculum
const CURRICULUM_OUTLINE = {
  6: {
    title: "Records in Salesforce: Record IDs (15 vs. 18 Characters), CRUD Operations & Recycle Bin",
    summary: "Comprehensive guide to record creation, edit locks, hard vs soft deletes, 15 vs 18 character Case-Sensitive IDs, and Recycle Bin retention rules.",
    badge: "Module 1 • Ep 6",
    readTime: "13 min read",
    diff: "Beginner",
  },
  7: {
    title: "Tabs in Salesforce: Custom Object Tabs, Web Tabs, Visualforce & Lightning Component Tabs",
    summary: "Configuring navigation tabs, tab visibility settings (Default On, Default Off, Tab Hidden), and embedding web applications.",
    badge: "Module 1 • Ep 7",
    readTime: "11 min read",
    diff: "Beginner",
  },
  8: {
    title: "Apps & App Launcher: Standard vs. Custom Apps, Navigation Styles & Brand Customization",
    summary: "Architecting Lightning Applications, standard navigation vs. console navigation, App Launcher permissions, and branded color palettes.",
    badge: "Module 1 • Ep 8",
    readTime: "12 min read",
    diff: "Beginner",
  },
  9: {
    title: "Page Layouts in Salesforce: Layout Editor, Sections, Related Lists & Profile Assignments",
    summary: "Designing user interfaces using the Classic Page Layout editor, required fields, read-only fields, related list sorting, and assignment matrices.",
    badge: "Module 1 • Ep 9",
    readTime: "14 min read",
    diff: "Beginner",
  },
  10: {
    title: "Record Types & Business Logic: Persona Tailoring, Page Layout Mapping & Picklist Filtering",
    summary: "Enterprise implementation of Record Types to drive differentiated business processes, custom picklist value subsets, and layout assignments.",
    badge: "Module 1 • Ep 10",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  11: {
    title: "Compact Layouts & Highlights Panel: Desktop & Mobile Header Architecture",
    summary: "Optimizing the top highlights panel for Lightning Experience and Salesforce Mobile app, primary compact layouts, and key field hierarchies.",
    badge: "Module 1 • Ep 11",
    readTime: "10 min read",
    diff: "Beginner",
  },
  12: {
    title: "Lightning App Builder & Pages: App, Home & Record Page Customization",
    summary: "Building reactive user interfaces using Lightning Web Components, component visibility filters, dynamic page activation, and org/app/profile defaults.",
    badge: "Module 1 • Ep 12",
    readTime: "15 min read",
    diff: "Intermediate",
  },
  13: {
    title: "Dynamic Forms in Salesforce: Upgrading Page Layouts & Conditional Field Visibility",
    summary: "Modernizing page architectures with Dynamic Forms: breaking bloated layouts into flexible field sections, reducing maintenance overhead, and field rules.",
    badge: "Module 1 • Ep 13",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  14: {
    title: "Relationships Part 1 (Lookup): 1-to-Many Architecture, Cascading & Self-Relationships",
    summary: "Deep dive into standard and custom Lookup relationships, loose coupling between entities, optional lookups, and deletion behaviors.",
    badge: "Module 1 • Ep 14",
    readTime: "15 min read",
    diff: "Intermediate",
  },
  15: {
    title: "Relationships Part 2 (Master-Detail): Cascade Deletes, Security Inheritance & Roll-up Summaries",
    summary: "Tight coupling data modeling, automated cascade delete mechanics, inherited record security, and COUNT/SUM/MIN/MAX Roll-up Summary fields.",
    badge: "Module 1 • Ep 15",
    readTime: "17 min read",
    diff: "Intermediate",
  },
  16: {
    title: "Schema Builder & Data Modeling: Visual ER Diagrams & Rapid Schema Prototyping",
    summary: "Visualizing complex enterprise data models with Schema Builder, creating objects and fields on canvas, and debugging relationship loops.",
    badge: "Module 1 • Ep 16",
    readTime: "12 min read",
    diff: "Beginner",
  },
  17: {
    title: "Validation Rules: Formula Error Logic, Error Display Positioning & PRIORVALUE Patterns",
    summary: "Enforcing enterprise data quality before commits: AND/OR boolean logic, REGEX validation, checking changed values, and bypass techniques.",
    badge: "Module 1 • Ep 17",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  18: {
    title: "Sales Process & Opportunity Lifecycle: Stages, Probabilities & Forecast Categories",
    summary: "Configuring pipeline governance: Sales Processes mapped to Opportunity stages, win probability percentages, and Collaborative Forecast categories.",
    badge: "Module 2 • Ep 18",
    readTime: "14 min read",
    diff: "Intermediate",
  },
  19: {
    title: "Buttons, Links & Actions: Detail Page Buttons, List View Actions & Quick Create Automations",
    summary: "Streamlining user workflows with Quick Actions, object-specific actions, global actions, custom URL parameters, and Lightning page headers.",
    badge: "Module 2 • Ep 19",
    readTime: "15 min read",
    diff: "Intermediate",
  },
  20: {
    title: "Web-to-Lead Automation: HTML Form Generation, Lead Queues & Auto-Response Rules",
    summary: "Capturing inbound leads from public web assets, embedding reCAPTCHA, handling daily submission limits, and automated welcome email chains.",
    badge: "Module 2 • Ep 20",
    readTime: "15 min read",
    diff: "Intermediate",
  },
  21: {
    title: "Web-to-Case Automation: Inbound Customer Support Portals & Case Routing Engines",
    summary: "Direct-to-case customer support intake forms, default case origins, assignment rule triggers, and automated notification routing.",
    badge: "Module 2 • Ep 21",
    readTime: "14 min read",
    diff: "Intermediate",
  },
  22: {
    title: "Email-to-Case Configuration: On-Demand Architecture, Routing Addresses & Threading Tokens",
    summary: "Automated support ticketing from email: Email-to-Case agents vs On-Demand service, routing addresses, email loop prevention, and modern email threading.",
    badge: "Module 2 • Ep 22",
    readTime: "16 min read",
    diff: "Advanced",
  },
  23: {
    title: "Field History Tracking & Feed Tracking: Compliance Audits & Chatter Governance",
    summary: "Audit-logging critical fields (up to 20 fields per object), Field History data retention, and configuring Chatter feed tracking for collaborative teams.",
    badge: "Module 2 • Ep 23",
    readTime: "12 min read",
    diff: "Beginner",
  },
  24: {
    title: "Public Groups in Salesforce: Shared User Collectives & Sharing Architectures",
    summary: "Architecting Public Groups combining users, roles, and sub-roles to power Sharing Rules, report folder access, and queue memberships.",
    badge: "Module 2 • Ep 24",
    readTime: "11 min read",
    diff: "Beginner",
  },
  25: {
    title: "Queues in Salesforce: Shared Workloads, Lead/Case Routing & Taking Ownership",
    summary: "Managing shared backlogs: supported queue objects, Lead/Case routing, queue email notifications, and list view acceptance workflows.",
    badge: "Module 2 • Ep 25",
    readTime: "13 min read",
    diff: "Beginner",
  },
  26: {
    title: "Approval Processes: Multi-Step Evaluation, Submission Actions & Rejection Paths",
    summary: "Automating governance: Entry criteria, automated routing to managers, unanimous vs first-responder approvals, field locks, and email alerts.",
    badge: "Module 2 • Ep 26",
    readTime: "18 min read",
    diff: "Advanced",
  },
  27: {
    title: "Classic Email Templates: Text, HTML, Custom Letterheads & Merge Field Logic",
    summary: "Authoring Classic templates, letterhead standards, merge fields for records and organizations, and automated workflow alert attachments.",
    badge: "Module 2 • Ep 27",
    readTime: "13 min read",
    diff: "Beginner",
  },
  28: {
    title: "Lightning Email Templates: Email Template Builder, Enhanced Letterheads & Folders",
    summary: "Modern drag-and-drop template designer, rich styling, enhanced letterheads, and granular folder sharing permissions.",
    badge: "Module 2 • Ep 28",
    readTime: "13 min read",
    diff: "Beginner",
  },
  29: {
    title: "Reports in Salesforce: Tabular, Summary & Matrix Reports, Custom Report Types & Bucketing",
    summary: "Analytics foundation: 4 report formats, cross-filters, filter logic (AND/OR), custom bucket fields, summary formulas, and report scheduling.",
    badge: "Module 3 • Ep 29",
    readTime: "18 min read",
    diff: "Intermediate",
  },
  30: {
    title: "Salesforce Dashboards: Charts, Gauges, Dynamic Dashboards & Folder Access Control",
    summary: "Executive business visualization: Chart types, metric widgets, dashboard filters, running user permissions (Viewer vs Specific User), and folder sharing.",
    badge: "Module 3 • Ep 30",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  31: {
    title: "Salesforce Security Architecture: The 4 Security Layers (Org, Object, Field, Record)",
    summary: "The definitive security blueprint: Layer 1 (Org/Network), Layer 2 (Object CRUD), Layer 3 (Field-Level Security), and Layer 4 (Record Sharing).",
    badge: "Module 4 • Ep 31",
    readTime: "20 min read",
    diff: "Advanced",
  },
  32: {
    title: "Users & Organization-Level Security: User Provisioning, Licenses, Locales & Deactivation",
    summary: "User management lifecycle: Standard vs User licenses, timezone/locale inheritance, password resets, and Deactivating vs Freezing user accounts.",
    badge: "Module 4 • Ep 32",
    readTime: "14 min read",
    diff: "Beginner",
  },
  33: {
    title: "Login Security, Password Policies, IP Ranges & Multi-Factor Authentication (MFA)",
    summary: "Hardening org access: Password expiration policies, Login Hours by Profile, Trusted IP Ranges vs Login IP Ranges, and mandatory MFA protocols.",
    badge: "Module 4 • Ep 33",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  34: {
    title: "Profiles, Permission Sets & Permission Set Groups: Minimum Access Principle",
    summary: "Modern authorization design: Baseline 1:1 user profile, additive Permission Sets for functional skills, Muting Permission Sets, and lifecycle management.",
    badge: "Module 4 • Ep 34",
    readTime: "18 min read",
    diff: "Intermediate",
  },
  35: {
    title: "Object-Level Security & CRUD: Create, Read, Edit, Delete & Administrative Overrides",
    summary: "Table-level authorization: CRUD basics, View All / Modify All per object, vs system-wide View All Data / Modify All Data super-permissions.",
    badge: "Module 4 • Ep 35",
    readTime: "15 min read",
    diff: "Intermediate",
  },
  36: {
    title: "Field-Level Security (FLS): Read Access, Edit Access & Platform Enforcement Truths",
    summary: "Securing specific data points: Visible vs Read-Only FLS, FLS overrides over page layouts, and how FLS protects data in reports, APIs, and search.",
    badge: "Module 4 • Ep 36",
    readTime: "16 min read",
    diff: "Intermediate",
  },
  37: {
    title: "Record-Level Security & OWD: Organization-Wide Defaults, Role Hierarchy & Sharing Rules",
    summary: "Mastering record access: Private vs Public OWD baselines, Role Hierarchy vertical roll-up, Criteria/Owner Sharing Rules, and manual sharing.",
    badge: "Module 4 • Ep 37",
    readTime: "20 min read",
    diff: "Advanced",
  },
  38: {
    title: "Restriction Rules & Scoping Rules in Salesforce: The GIVE vs. RESTRICT Paradigm",
    summary: "Advanced record filtering: Why Sharing Rules only grant access, how Restriction Rules take away access matching criteria, and Scoping Rules for focused list views.",
    badge: "Module 4 • Ep 38",
    readTime: "17 min read",
    diff: "Advanced",
  },
  39: {
    title: "My Domain, Login Access & Session Security: Subdomains, Support Access & Timeouts",
    summary: "Enterprise identity infrastructure: Custom My Domain branding, granting Login Access to Administrators/Support, Session Inactivity timeouts, and High Assurance MFA.",
    badge: "Module 4 • Ep 39",
    readTime: "16 min read",
    diff: "Intermediate",
  },
};

// Generates rich section explanations for episodes 6..39
function getDetailedSectionsForEp(ep, meta) {
  return [
    {
      heading: `1. Conceptual Architecture & Core Concepts (${meta.title})`,
      content: `${meta.summary}\n\nIn this lesson of the SacWac Salesforce Administrator Full Course, we examine the fundamental architecture of this capability within the Salesforce multi-tenant platform. Understanding both the business use cases and technical limitations is critical for enterprise implementation and the Salesforce Certified Administrator exam.\n\nKey Principles:\n• Configuration over custom code: Utilizing standard platform capabilities to minimize technical debt.\n• Scalability: Ensuring designs accommodate high data volumes (LDV) and evolving business requirements.\n• Auditability: Designing configurations with clear traceability and change tracking.`,
      keyTakeaways: [
        "Always test changes thoroughly in a Developer Sandbox before deploying to Production.",
        "Document configuration metadata and business requirements for maintainability.",
      ],
    },
    {
      heading: `2. Practical Implementation Walkthrough & Best Practices`,
      content: `Step-by-step guidance and enterprise considerations for ${meta.title}:\n\n1. Navigation: Access Setup > Object Manager or Administration controls.\n2. Best Practices:\n   • Follow standard naming conventions (clear labels, API names, and descriptions).\n   • Review user permissions and security implications (FLS, OWD, Profile access).\n   • Consider user experience on both Desktop Lightning Experience and Salesforce Mobile app.\n3. Common Pitfalls to Avoid:\n   • Creating redundant configurations that conflict with existing automation.\n   • Neglecting documentation and description fields on custom components.\n   • Failing to test with multiple user personas with restricted permissions.`,
      codeSnippet: `// Example verification or formula logic for Episode ${ep}
// Always validate null checks and active user criteria:
AND(
  $User.UIThemeDisplayed = "Theme4d",
  NOT(ISBLANK(Id))
)`,
      language: "sql",
      keyTakeaways: [
        "Always review the impact on downstream automation (Flows, Validation Rules, Apex).",
        "Use descriptive names and comments on all custom configurations.",
      ],
    },
    {
      heading: `3. Exam Essentials & Key Takeaways for ADM-201`,
      content: `For the Salesforce Certified Administrator examination, remember the following critical concepts regarding this topic:\n\n• Who can configure this? Typically System Administrators with 'Customize Application' permission.\n• What are the limits? Always be aware of governor limits, edition restrictions (Enterprise vs Unlimited), and maximum thresholds.\n• How does this interact with Security? Layer permissions strictly: Org Level > Object Level > Field Level > Record Level.\n\nKeep this study guide accessible as a reference during your revision!`,
      keyTakeaways: [
        "Core exam focus: Know the default behavior when no custom settings are applied.",
        "Security baseline: Access is additive through Permission Sets and Sharing Rules, but restricted through Restriction Rules.",
      ],
    },
  ];
}

async function main() {
  console.log("=== STARTING ADMIN COURSE NOTES MIGRATION & UPLOAD ===");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas!");

  // Load local videos.json
  const videosPath = path.join(__dirname, "../src/data/videos.json");
  const localVideos = JSON.parse(fs.readFileSync(videosPath, "utf-8"));

  // Build map of Episode -> Video
  const epToVideo = {};
  for (const v of localVideos) {
    const m = v.title.match(/Episode\s*(\d+)/i);
    if (m) {
      const epNum = parseInt(m[1]);
      epToVideo[epNum] = v;
    }
  }

  // Handle bonus videos
  const bonusVideos = {
    0: localVideos.find((v) => v.id === "vid-Ej1n9Wve69Q"),
    1.5: localVideos.find((v) => v.id === "vid-7o9js4UeffU"),
    26.5: localVideos.find((v) => v.id === "vid-11ZOu6V1PSg"),
    33.5: localVideos.find((v) => v.id === "vid--lwz_VpW-vM"),
  };

  const allNotesToSave = [];

  // Loop through episodes 1 to 39
  for (let ep = 1; ep <= 39; ep++) {
    console.log(`\n--- Processing Episode ${ep} ---`);
    const noteId = `admin-episode-${ep}`;
    const pdfFilename = `Episode ${ep} Notes.pdf`;
    const localPdfPath = path.join(NOTES_FOLDER, pdfFilename);

    let pdfUrl = undefined;

    // Check if PDF exists locally
    if (fs.existsSync(localPdfPath)) {
      console.log(`Found PDF: ${pdfFilename} (${(fs.statSync(localPdfPath).size / 1024).toFixed(1)} KB)`);
      try {
        console.log(`Uploading ${pdfFilename} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(localPdfPath, {
          folder: "sacwac_docs/admin_course",
          resource_type: "auto",
          public_id: `admin_episode_${ep}_notes`,
          overwrite: true,
        });
        pdfUrl = result.secure_url;
        console.log(`Uploaded to Cloudinary: ${pdfUrl}`);
      } catch (err) {
        console.error(`Cloudinary upload failed for Ep ${ep}:`, err.message);
      }
    } else {
      console.log(`No local PDF found for Episode ${ep} (e.g. Formula Fields)`);
    }

    // Determine metadata and content
    let noteData = EPISODE_DATA.find((e) => e.ep === ep);
    if (!noteData) {
      const outline = CURRICULUM_OUTLINE[ep] || {
        title: `Salesforce Administrator Episode ${ep}`,
        summary: `Comprehensive study guide and architectural breakdown for Episode ${ep}.`,
        badge: `Module • Ep ${ep}`,
        readTime: "14 min read",
        diff: "Intermediate",
      };
      noteData = {
        ep,
        title: outline.title,
        badge: outline.badge,
        readTime: outline.readTime,
        difficulty: outline.diff,
        summary: outline.summary,
        sections: getDetailedSectionsForEp(ep, outline),
      };
    }

    const matchingVideo = epToVideo[ep];
    const videoId = matchingVideo ? matchingVideo.id : undefined;

    const noteDoc = {
      id: noteId,
      title: noteData.title,
      category: "Admin",
      summary: noteData.summary,
      readTime: noteData.readTime,
      updatedAt: "Official SacWac 2026 Edition",
      badge: noteData.badge,
      difficulty: noteData.difficulty,
      sections: noteData.sections,
      pdfUrl: pdfUrl,
      isFeatured: ep <= 5,
      order: ep,
      episode: ep,
      videoId: videoId,
    };

    // Upsert into MongoDB NoteModel
    await NoteModel.findOneAndUpdate({ id: noteId }, noteDoc, { upsert: true, returnDocument: "after" });
    allNotesToSave.push(noteDoc);

    // If matching video exists, update it in MongoDB and in local videos
    if (matchingVideo) {
      matchingVideo.episode = ep;
      matchingVideo.noteId = noteId;
      matchingVideo.hasNotes = true;

      await VideoModel.findOneAndUpdate(
        { id: matchingVideo.id },
        {
          $set: {
            episode: ep,
            noteId: noteId,
            hasNotes: true,
          },
        }
      );
      console.log(`Linked Note ${noteId} -> Video ${matchingVideo.id} (Title: ${matchingVideo.title.slice(0, 40)}...)`);
    }
  }

  // Also fix episode numbers on bonus videos
  if (bonusVideos[0]) {
    bonusVideos[0].episode = 0;
    await VideoModel.findOneAndUpdate({ id: bonusVideos[0].id }, { $set: { episode: 0 } });
  }

  // Save updated local JSON files
  console.log("\nSynchronizing local JSON fallbacks...");
  const notesPath = path.join(__dirname, "../src/data/notes.json");
  // Keep any existing non-admin notes (Flows, Apex, etc.)
  const existingNotes = JSON.parse(fs.readFileSync(notesPath, "utf-8"));
  const nonAdminNotes = existingNotes.filter((n) => !n.id.startsWith("admin-episode-"));
  const combinedNotes = [...allNotesToSave, ...nonAdminNotes];

  fs.writeFileSync(notesPath, JSON.stringify(combinedNotes, null, 2), "utf-8");
  fs.writeFileSync(videosPath, JSON.stringify(localVideos, null, 2), "utf-8");

  console.log(`Successfully saved ${combinedNotes.length} notes to ${notesPath}`);
  console.log(`Successfully saved ${localVideos.length} videos to ${videosPath}`);
  console.log("\n=== MIGRATION COMPLETE! ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
