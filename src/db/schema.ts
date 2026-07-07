import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "villa",
  "studio",
  "office",
  "land",
  "shop",
]);

export const listingTypeEnum = pgEnum("listing_type", [
  "sale",
  "rent",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "sold",
  "rented",
  "pending",
]);

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyType: propertyTypeEnum("property_type").notNull().default("apartment"),
  listingType: listingTypeEnum("listing_type").notNull().default("sale"),
  status: propertyStatusEnum("status").notNull().default("available"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  area: integer("area"), // m²
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  floor: integer("floor"),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  address: text("address"),
  mapUrl: text("map_url"), // Google Maps URL
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  images: text("images"), // JSON array of image URLs
  videoUrl: text("video_url"),
  featured: boolean("featured").default(false),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerPhone: varchar("owner_phone", { length: 20 }),
  ownerWhatsapp: varchar("owner_whatsapp", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  contactTime: varchar("contact_time", { length: 100 }),
  clientType: varchar("client_type", { length: 20 }).notNull().default("buyer"), // buyer, seller, tenant
  notes: text("notes"),
  city: varchar("city", { length: 100 }),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  clientId: integer("client_id").references(() => clients.id),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("new"), // new, contacted, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
