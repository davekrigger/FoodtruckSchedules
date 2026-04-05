# Food Truck Schedules

A mobile-responsive web app (PWA) where food truck operators post their schedules and people find their favorite food trucks.

Domain: foodtruckschedules.com

## Tech Stack
- **Frontend**: React (mobile-responsive, PWA)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Netlify
- **Version Control**: GitHub

## User Groups

### Admin (solo developer/owner)
- Seeds the initial venue list
- Reviews and approves/rejects new venues submitted by food truck operators
- Standardizes venue names to prevent duplicates

### Food Truck Operators (authenticated)
- Can manage multiple trucks
- Each truck has a cuisine type
- Post, edit, and cancel schedule entries (date, time, venue)
- Can submit new venues (goes to admin for approval before going live)

### Public Users (no account required)
- Search for food trucks by name, location (near me), or date/time
- View schedules and venues
- No login needed

### Registered Users (authenticated)
- Everything public users can do
- Save favorite food trucks and venues
- Receive notifications when a favorited truck or venue posts/changes a schedule

## Data Model (high level)

- **Venues**: name, address, location (lat/lng), type (brewery, church, fairground, etc.), approved (bool)
- **Trucks**: name, cuisine, owner (operator user id)
- **Schedules**: truck_id, venue_id, date, start_time, end_time, status (active/cancelled)
- **Users**: email, role (operator | user)
- **Favorites**: user_id, truck_id or venue_id

## Key Rules
- Venues added by operators are NOT visible until approved by admin
- Searching is fully public — no login wall
- Authentication is handled by Supabase Auth
- All database access should use Supabase Row Level Security (RLS)
- This is US-only for now

## Project Constraints
- Solo developer, limited budget — avoid paid services beyond existing subscriptions
- Existing subscriptions: Supabase (free tier), Netlify (free tier), GitHub (free tier), Claude
- Keep the architecture simple — no microservices, no unnecessary complexity

## Commands
(fill in once project is initialized)
- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run deploy` — deploy to Netlify
