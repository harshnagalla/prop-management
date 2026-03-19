import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const propertyTypeEnum = pgEnum("property_type", [
  "residential",
  "commercial",
  "industrial",
  "land",
  "mixed",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "occupied",
  "vacant",
  "under_renovation",
  "for_sale",
  "sold",
]);

export const billCategoryEnum = pgEnum("bill_category", [
  "electricity",
  "water",
  "municipal_tax",
  "maintenance",
  "insurance",
  "repair",
  "legal",
  "other",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "sale_deed",
  "agreement",
  "registration",
  "tax_receipt",
  "bill",
  "photo",
  "other",
]);

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").default("Ahmedabad"),
  type: propertyTypeEnum("type").notNull().default("residential"),
  status: propertyStatusEnum("status").notNull().default("vacant"),
  purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }),
  area: numeric("area", { precision: 10, scale: 2 }),
  areaUnit: text("area_unit").default("sqft"),
  areaDetails: text("area_details"),
  monthlyRent: numeric("monthly_rent", { precision: 12, scale: 2 }),
  tenantName: text("tenant_name"),
  notes: text("notes"),

  // Registration details
  dastavejNo: text("dastavej_no"),
  registrationDate: timestamp("registration_date"),
  stampDuty: numeric("stamp_duty", { precision: 12, scale: 2 }),
  registrationCharges: numeric("registration_charges", { precision: 12, scale: 2 }),

  // Ownership
  ownership: text("ownership"),
  ownershipPercent: numeric("ownership_percent", { precision: 5, scale: 2 }),

  // Geolocation
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),

  // Sale tracking
  salePrice: numeric("sale_price", { precision: 15, scale: 2 }),
  saleDate: timestamp("sale_date"),
  buyer: text("buyer"),

  // Lease tracking
  leaseStart: timestamp("lease_start"),
  leaseEnd: timestamp("lease_end"),
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  category: billCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  isPaid: boolean("is_paid").default(false).notNull(),
  vendor: text("vendor"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rentalIncome = pgTable("rental_income", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  receivedDate: timestamp("received_date"),
  isReceived: boolean("is_received").default(false).notNull(),
  tenantName: text("tenant_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull().default("other"),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  aiExtractedData: text("ai_extracted_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;
export type RentalIncome = typeof rentalIncome.$inferSelect;
export type NewRentalIncome = typeof rentalIncome.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export const propertyRemarks = pgTable("property_remarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyRemark = typeof propertyRemarks.$inferSelect;
export type NewPropertyRemark = typeof propertyRemarks.$inferInsert;

export const propertyValueHistory = pgTable("property_value_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
export type PropertyValueHistory = typeof propertyValueHistory.$inferSelect;
