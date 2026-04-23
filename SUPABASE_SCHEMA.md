# Supabase Database Schema

Complete SQL to set up all tables for the revamped logistics system.
Run these in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).

---

## 1. Existing Tables (unchanged — already in your database)

These tables already exist from your original project:
- `profiles` (with `role` column: 'user', 'admin', 'superadmin')
- `packages`
- `package_images`
- `shipment_events`
- `chats`
- `chat_messages`
- `admin_public_emails`

---

## 2. Add `port_admin` Role to Existing Profiles

Add the new port_admin role to your existing profiles table:

```sql
-- If your role column uses an enum, add the new value:
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'port_admin';

-- If your role column is just text (varchar), no change needed.
-- Just set role = 'port_admin' for port admin users.
```

---

## 3. New Tables for Sea Freight Container Tracking

### containers table
Stores the main container record.

```sql
CREATE TABLE containers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Container identification
  container_number  VARCHAR(11) NOT NULL UNIQUE,   -- e.g. MSKU1234567 (4 letters + 7 digits)
  container_type    VARCHAR(50) DEFAULT '40ft Dry', -- 20ft Dry, 40ft HC, Reefer, etc.
  
  -- Cargo info
  owner_name          VARCHAR(255),                -- Client / consignee name
  gross_weight_kg     NUMERIC(10, 2),              -- Gross weight in kilograms
  cargo_description   TEXT,                        -- What's inside
  
  -- Voyage info
  vessel_name         VARCHAR(255),               -- Ship name
  voyage_number       VARCHAR(100),               -- Shipping line voyage number
  
  -- Route
  port_of_loading     VARCHAR(255) NOT NULL,      -- Origin port
  port_of_discharge   VARCHAR(255) NOT NULL,      -- Destination port
  eta                 TIMESTAMPTZ,                 -- Expected time of arrival
  
  -- Status (free text so admin can enter custom statuses)
  status              VARCHAR(100) DEFAULT 'Pending',
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update the updated_at timestamp on every update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### container_events table
Timeline of port events for each container.

```sql
CREATE TABLE container_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id    UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  
  event_type      VARCHAR(100) NOT NULL,          -- e.g. 'Customs Cleared'
  location        VARCHAR(255) NOT NULL,          -- e.g. 'Apapa Port, Lagos'
  description     TEXT,                           -- Optional notes
  event_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries when loading a container's events
CREATE INDEX idx_container_events_container_id ON container_events(container_id);
```

### container_images table
References to photos stored in Supabase Storage.

```sql
CREATE TABLE container_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id    UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  
  image_path      TEXT NOT NULL,                  -- Filename in the 'container-images' storage bucket
  caption         TEXT DEFAULT '',                -- Optional description
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster image lookups
CREATE INDEX idx_container_images_container_id ON container_images(container_id);
```

---

## 4. Row Level Security (RLS) Policies

RLS ensures port admins can ONLY manage their own containers, not others'.

```sql
-- Enable RLS on all new tables
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_images ENABLE ROW LEVEL SECURITY;

-- ── containers policies ──

-- Anyone can VIEW containers (public tracking)
CREATE POLICY "Public can view containers"
  ON containers FOR SELECT
  USING (true);

-- Only the admin who created it can INSERT/UPDATE/DELETE
CREATE POLICY "Port admins can create containers"
  ON containers FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Port admins can update their containers"
  ON containers FOR UPDATE
  USING (auth.uid() = admin_id);

CREATE POLICY "Port admins can delete their containers"
  ON containers FOR DELETE
  USING (auth.uid() = admin_id);

-- ── container_events policies ──

-- Public can view events (needed for tracking result modal)
CREATE POLICY "Public can view container events"
  ON container_events FOR SELECT
  USING (true);

-- Only the owner of the parent container can add/delete events
CREATE POLICY "Port admins can manage events for their containers"
  ON container_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM containers
      WHERE containers.id = container_events.container_id
        AND containers.admin_id = auth.uid()
    )
  );

-- ── container_images policies ──

CREATE POLICY "Public can view container images"
  ON container_images FOR SELECT
  USING (true);

CREATE POLICY "Port admins can manage images for their containers"
  ON container_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM containers
      WHERE containers.id = container_images.container_id
        AND containers.admin_id = auth.uid()
    )
  );
```

---

## 5. Supabase Storage Bucket

In your Supabase dashboard go to **Storage → New Bucket** and create:

| Setting | Value |
|---------|-------|
| Bucket name | `container-images` |
| Public | **No** (private — we use signed URLs) |
| Max file size | 5 MB |
| Allowed MIME types | `image/jpeg, image/png, image/webp` |

Then add this Storage Policy so port admins can upload:

```sql
-- In the Supabase Dashboard > Storage > Policies > container-images

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Port admins can upload container images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'container-images' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Port admins can delete container images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'container-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to read (we generate signed URLs anyway)
CREATE POLICY "Public can read container images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'container-images');
```

---

## 6. Create a Port Admin User

1. In Supabase Dashboard → **Authentication → Users → Invite User**
   - Enter your friend's email and send the invite
2. After they set their password, go to **Table Editor → profiles**
3. Find their row and set `role = 'port_admin'`

They can then log in at: `yoursite.com/port-admin/login`

---

## 7. Example Test Data (optional)

Seed a test container to make sure everything works:

```sql
-- First get a port admin's user ID from the profiles table
-- Then run:

INSERT INTO containers (
  admin_id,
  container_number,
  container_type,
  owner_name,
  gross_weight_kg,
  cargo_description,
  vessel_name,
  voyage_number,
  port_of_loading,
  port_of_discharge,
  eta,
  status
) VALUES (
  'YOUR-PORT-ADMIN-USER-ID',  -- Replace with actual UUID from profiles table
  'MSKU1234567',
  '40ft Dry',
  'ABC Trading Ltd',
  24500,
  'Mixed consumer electronics and household goods',
  'MSC Gülsün',
  '0VB8W1MA',
  'Shanghai, China',
  'Lagos, Nigeria (Apapa Port)',
  NOW() + INTERVAL '14 days',
  'In Transit'
);

-- Add some events for the test container
INSERT INTO container_events (container_id, event_type, location, description, event_time)
SELECT
  id,
  'Container Registered',
  'Shanghai Port, China',
  'Container loaded and registered in the system.',
  NOW() - INTERVAL '7 days'
FROM containers WHERE container_number = 'MSKU1234567';

INSERT INTO container_events (container_id, event_type, location, description, event_time)
SELECT
  id,
  'Vessel Departed',
  'Shanghai Port, China',
  'MSC Gülsün departed from Yangshan Deep-Water Port.',
  NOW() - INTERVAL '5 days'
FROM containers WHERE container_number = 'MSKU1234567';

INSERT INTO container_events (container_id, event_type, location, description, event_time)
SELECT
  id,
  'In Transit',
  'Indian Ocean',
  'Vessel en route to Apapa Port, Lagos.',
  NOW() - INTERVAL '2 days'
FROM containers WHERE container_number = 'MSKU1234567';
```

Now search for `MSKU1234567` on the container tracking page to test it!
