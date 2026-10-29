# Rules: Backend & Data Persistence Architecture

**Runtime:** Next.js Route Handlers (Edge / Node.js Runtime)  
**Database:** MongoDB Atlas via Mongoose 9  
**Fallback:** Server In-Memory Cache + Client LocalStorage Cache  

---

## 1. API Route Handler Design

1. **RESTful Standard:**
   - `GET /api/books`: Query catalog with filter params (`q`, `category`, `admin`).
   - `POST /api/books`: Create or upsert a verified codex.
   - `GET /api/books/[id]`: Retrieve single codex with complete chapter tree.
   - `PUT /api/books/[id]`: Partial or full update.
   - `DELETE /api/books/[id]`: Hard delete (restricted to admin).
   - `GET / POST /api/settings`: Fetch and save site layout and Codex Reader settings.
2. **Standardized Response Envelope:**
   ```json
   {
     "success": true,
     "source": "MongoDB Atlas | Local Storage",
     "data": {},
     "message": "Optional status message"
   }
   ```
3. **HTTP Status Code Discipline:**
   - `200 OK`: Successful read or update.
   - `201 Created`: Successful resource creation.
   - `400 Bad Request`: Payload validation failure with explicit error message.
   - `401 Unauthorized`: Attempt to mutate without valid admin credentials.
   - `404 Not Found`: Target ID does not exist in collection.
   - `500 Internal Server Error`: Unhandled server/database exception.

---

## 2. Database Connection Pooling & DNS Guardrails

1. **Global Connection Cache:**
   - Always utilize the global `mongooseCache` singleton pattern in `src/lib/mongodb.ts` to prevent connection exhaustion during hot-reloading in development.
   - Set `maxPoolSize: 10` and `serverSelectionTimeoutMS: 5000`.
2. **Windows & ISP SRV DNS Resolution:**
   - Mongoose SRV connection strings (`mongodb+srv://`) can occasionally fail DNS resolution on certain local networks or Windows configurations. The connection helper must safeguard via `dns.setServers(['8.8.8.8', '1.1.1.1'])`.

---

## 3. Data Validation & Schemas

1. **Required Book Fields:**
   - `title`: String (trimmed, non-empty)
   - `arabicTitle`: String (trimmed, non-empty)
   - `author`: String (trimmed, non-empty)
   - `discipline`: String (must match one of the recognized classification slugs)
   - `chapters`: Array of `IChapter` documents (minimum 1 chapter required).
2. **Indexes:**
   - Index `id` uniquely on all models.
   - Index `discipline`, `published`, and text search fields (`title`, `author`, `arabicTitle`).

---

## 4. Error Handling & Graceful Fallback

1. Wrap every route handler in a `try...catch` block.
2. If MongoDB is disconnected or fails to respond, **never throw an unhandled 500 error that breaks the client application**. Instead, return a structured 200/400 fallback response indicating local operation.
