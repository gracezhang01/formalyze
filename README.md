# Formalyze: AI Survey Creator and Chat Hub

## Get Started

1.  **Install dependencies:**
    ```bash
    npm i
    ```
2.  **Set up environment variables:**
    Copy the `.env.example` file in this archive to a new file named `.env` and fill in the required values.
3.  **Run the development server:**
    ```bash
    npm run dev
    ```

database password: gulianxiaogulianxiaogulianxiaogulianxiaogulianxiaogulianxiao

## DB Migration

### Local Development

1. **Start the local Docker container:**
   ```bash
   supabase start
   ```
   or, if you use Docker Compose directly:
   ```bash
   docker compose up
   ```

2. **Run migrations locally:**
   ```bash
   supabase migration up
   ```
   This will apply all migration files in your `supabase/migrations` directory to your local database.

3. **Access your local Supabase Studio:**
   - Open [http://localhost:54323](http://localhost:54323) in your browser.

---

### Production (Supabase Cloud)

1. **Link your local project to your Supabase project:**
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
   Replace `<your-project-ref>` with your actual Supabase project reference (e.g., `zhqpuffoyiagmnhosqkk`).

2. **Push migrations to production:**
   ```bash
   supabase db push
   ```
   This will apply all local migrations to your production Supabase database.

3. **(Optional) Set your database password:**
   - You may be prompted for your database password. You can find or reset it in your Supabase project dashboard under **Settings > Database > Connection string**.

---

### Useful Commands

- **Create a new migration:**
  ```bash
  supabase migration new <migration-name>
  ```
- **Check migration status:**
  ```bash
  supabase migration status
  ```

---

**Note:**  
- Always review your migration files before pushing to production.
- Make sure your local and production environments are in sync to avoid conflicts.

