# 🚀 CODIA PLATFORM TRACKER

Real-time visual dashboard for tracking CODIA platform development across 10 weeks.

## Features

- 📊 **Master Map**: Overall progress visualization
- ✅ **Checklists**: Interactive task tracking by phase
- 📝 **Logs**: Real-time execution history
- 🔄 **Real-time Updates**: Live sync with Supabase
- 📱 **Responsive**: Works on desktop, tablet, mobile
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Update `src/lib/supabase.js` with your Supabase credentials:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_KEY = 'your-anon-key';
```

### 3. Create Database Tables

Run this SQL in Supabase:

```sql
-- Phases table
CREATE TABLE phases (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  week_start INT,
  week_end INT,
  status TEXT,
  progress INT DEFAULT 0,
  kpi TEXT,
  deliverable TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  phase_id INT REFERENCES phases(id),
  week INT,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  date_start DATE,
  date_end DATE,
  notes TEXT,
  blocked_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'SUCCESS'
);
```

### 4. Seed Initial Data

Insert your phases and tasks into the database.

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Usage

### Overview Tab
- See overall progress across all phases
- View phase-by-phase breakdown
- Track KPIs and deliverables

### Phase Tabs
- View tasks for each phase
- Update task status (Pending → In Progress → Done)
- Add notes and track blockers

### Logs Tab
- See real-time execution history
- Filter by status (Success, Failed, In Progress)
- Track all actions and updates

## Deployment

### Deploy to Vercel

```bash
npm run build
npm run deploy
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Real-time Features

The app automatically syncs with Supabase:
- Task status changes update instantly
- Progress bars animate in real-time
- New logs appear immediately
- No manual refresh needed

## API Integration

The app uses Supabase MCP for:
- Reading phases and tasks
- Updating task status
- Adding log entries
- Real-time subscriptions

## Customization

### Add New Components

1. Create component in `src/components/`
2. Import in `App.jsx`
3. Add to navigation tabs

### Modify Colors

Edit `tailwind.config.js` to change theme colors.

### Add New Phases

Insert new phases in Supabase `phases` table.

## Troubleshooting

### Supabase Connection Issues
- Check API credentials in `src/lib/supabase.js`
- Verify Supabase project is active
- Check network connectivity

### Real-time Updates Not Working
- Ensure Supabase subscriptions are enabled
- Check browser console for errors
- Verify table permissions in Supabase

### Build Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `rm -rf .vite`

## License

MIT

## Support

For issues or questions, check the CODIA documentation or contact the team.
