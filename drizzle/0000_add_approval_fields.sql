CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('available', 'sold', 'rented', 'pending');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'villa', 'studio', 'office', 'land', 'shop');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"whatsapp" varchar(20),
	"contact_time" varchar(100),
	"client_type" varchar(20) DEFAULT 'buyer' NOT NULL,
	"notes" text,
	"city" varchar(100),
	"budget" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"client_id" integer,
	"message" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"property_type" "property_type" DEFAULT 'apartment' NOT NULL,
	"listing_type" "listing_type" DEFAULT 'sale' NOT NULL,
	"status" "property_status" DEFAULT 'available' NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"area" integer,
	"bedrooms" integer,
	"bathrooms" integer,
	"floor" integer,
	"city" varchar(100) NOT NULL,
	"district" varchar(100),
	"address" text,
	"map_url" text,
	"latitude" varchar(20),
	"longitude" varchar(20),
	"images" text,
	"video_url" text,
	"featured" boolean DEFAULT false,
	"is_approved" boolean DEFAULT true,
	"submitted_by" integer,
	"owner_name" varchar(255),
	"owner_phone" varchar(20),
	"owner_whatsapp" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;