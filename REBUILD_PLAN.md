# Spiral Light App - Supabase Rebuild Plan

## Current State Analysis

### Existing Features
- ✅ Client management (CRUD operations)
- ✅ Session management with detailed intake forms
- ✅ Search functionality
- ✅ Client intake form link generation
- ✅ Session status tracking (pending/approved)
- ✅ Modern, responsive UI
- ❌ Data stored in localStorage (browser-specific, no sync)
- ❌ No multi-user support
- ❌ No data backup/restore
- ❌ No offline-first capabilities

### Data Structure

**Clients:**
- id, name, age, dob, email, phone, address, city, postal
- occupation, referredBy, md
- createdAt, updatedAt

**Sessions:**
- id, clientId, date, status, practitioner
- complaints (array), aggravates, swelling, injurySite
- medications (array), healthcare (array), therapies (array)
- implants, injuries (array), operations (array)
- exercise, bowenHistory, additional, notes
- createdAt, updatedAt

## Proposed Architecture

### 1. Project Structure
```
spiral-light-app/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js          # Supabase configuration
│   ├── supabase.js        # Supabase client & service layer
│   ├── clients.js         # Client management logic
│   ├── sessions.js        # Session management logic
│   └── app.js             # Main app initialization
├── config.example.js      # Example configuration file
└── README.md
```

### 2. Supabase Database Schema

**clients table:**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER,
  dob DATE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal TEXT,
  occupation TEXT,
  referred_by TEXT,
  md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);
```

**sessions table:**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  practitioner TEXT,
  complaints JSONB DEFAULT '[]',
  aggravates TEXT,
  swelling TEXT,
  injury_site TEXT,
  medications JSONB DEFAULT '[]',
  healthcare JSONB DEFAULT '[]',
  therapies JSONB DEFAULT '[]',
  implants TEXT,
  injuries JSONB DEFAULT '[]',
  operations JSONB DEFAULT '[]',
  exercise TEXT,
  bowen_history TEXT,
  additional TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);
```

**Row Level Security (RLS):**
- Enable RLS on both tables
- Create policies for authenticated users (if adding auth later)
- For now, can use service role key or disable RLS for MVP

### 3. Key Improvements

#### User Experience
1. **Loading States**: Show spinners/skeletons during data operations
2. **Error Handling**: User-friendly error messages with retry options
3. **Optimistic Updates**: Update UI immediately, sync in background
4. **Toast Notifications**: Better feedback for all actions
5. **Form Validation**: Client-side validation before submission
6. **Auto-save**: Save drafts automatically
7. **Search Improvements**: Debounced search, highlight matches

#### Technical Improvements
1. **Modular Code**: Separate concerns into different files
2. **Error Recovery**: Retry failed operations
3. **Data Validation**: Validate data before sending to Supabase
4. **Type Safety**: Add JSDoc comments for better IDE support
5. **Performance**: Lazy load data, pagination for large lists
6. **Caching**: Cache frequently accessed data

#### Future Enhancements
1. **Authentication**: Multi-user support with Supabase Auth
2. **File Uploads**: Store intake form PDFs in Supabase Storage
3. **Email Integration**: Send intake form links via email
4. **Analytics**: Track session statistics
5. **Export**: Export data to CSV/PDF
6. **Offline Support**: Service workers for offline functionality

### 4. Migration Strategy

1. **Phase 1**: Set up Supabase project and database
2. **Phase 2**: Create new modular file structure
3. **Phase 3**: Implement Supabase service layer
4. **Phase 4**: Migrate client management
5. **Phase 5**: Migrate session management
6. **Phase 6**: Add UX improvements (loading, errors, etc.)
7. **Phase 7**: Data migration tool (optional - for existing localStorage data)

### 5. Configuration

Users will need to:
1. Create a Supabase project
2. Run the SQL schema
3. Get their Supabase URL and anon key
4. Add to `config.js`

We'll provide:
- SQL migration file
- Setup instructions
- Example config file

## Implementation Steps

1. ✅ Create project structure
2. ✅ Set up Supabase configuration
3. ✅ Create database schema SQL
4. ✅ Build Supabase service layer
5. ✅ Refactor client management
6. ✅ Refactor session management
7. ✅ Add UX improvements
8. ✅ Create setup documentation

