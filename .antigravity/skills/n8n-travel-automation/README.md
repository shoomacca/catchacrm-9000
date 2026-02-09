# n8n Travel Content Automation Skill

**Purpose:** Guidelines and patterns for building n8n workflows that generate structured travel content using SerpApi and Gemini AI.

**MCP Servers Required:**
- `n8n-local` (https://ai.bsbsbs.au)
- `n8n-cloud` (https://vintoai.app.n8n.cloud)

---

## Skill Components

### 1. Workflow Architecture Patterns

**Sub-workflow Pattern:**
- Break complex workflows into reusable sub-workflows
- Cache lookup sub-workflow (check → scrape → save)
- Data processing sub-workflow (validate → transform → format)
- Output delivery sub-workflow (save → notify → log)

**Error Handling Pattern:**
- Retry failed API calls (3x with exponential backoff)
- Log errors to n8n Data Table or Google Sheets
- Continue workflow on non-critical failures
- Send notifications on critical failures

**State Management Pattern:**
- Use n8n Data Tables for caching (TTL: 30 days)
- Track processed items to avoid duplicates
- Store intermediate results for resume capability
- Log execution history for debugging

### 2. API Integration Best Practices

**SerpApi (Google Hotels Engine):**
```javascript
// Use HTTP Request node
{
  "method": "GET",
  "url": "https://serpapi.com/search",
  "qs": {
    "engine": "google_hotels",
    "q": "luxury hotels in Sydney",
    "api_key": "{{$credentials.serpApi.apiKey}}"
  },
  "options": {
    "timeout": 30000,
    "retry": {
      "maxAttempts": 3,
      "waitBetween": 2000
    }
  }
}
```

**Gemini AI (Structured Extraction):**
```javascript
// Use Google Gemini Chat node
{
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.1, // Low for deterministic extraction
  "maxTokens": 4096,
  "systemMessage": "Extract hotel data into JSON schema",
  "useStructuredOutput": true,
  "responseSchema": { /* Zod or JSON schema */ }
}
```

**Google Drive (Image Storage):**
```javascript
// Use Google Drive node - Upload action
{
  "folderId": "{{$json.drive_folder_id}}",
  "fileName": "{{$json.hotel_slug}}.jpg",
  "mimeType": "image/jpeg",
  "options": {
    "convertToGoogleDocs": false,
    "updateIfExists": true
  }
}
```

### 3. Data Schema Standardization

**HotelData Schema:**
```typescript
{
  hotel_id: string,          // Unique identifier
  hotel_name: string,         // Official name
  location: string,           // City, State
  country: string,            // Country name
  star_rating: number,        // 1-5
  price_amount: number,       // Nightly rate
  price_currency: string,     // USD, AUD, etc.
  room_type: string,          // Room category
  location_summary: string,   // Brief description
  review_score: number,       // 0-10
  review_count: number,       // Number of reviews
  amenities: string[],        // List of amenities
  source_url: string,         // Original listing URL
  image_url: string,          // Featured image URL
  image_filename: string,     // SEO-friendly filename
  image_drive_url: string,    // Google Drive URL
  scraped_at: string,         // ISO 8601 timestamp
  cache_expires_at: string    // ISO 8601 timestamp
}
```

### 4. Workflow Naming Conventions

**Format:** `[PROJECT] - Purpose - Version`

Examples:
- `[TRAVEL] - SerpApi Hotel Scraper - v1`
- `[TRAVEL] - Gemini Content Generator - v1`
- `[TRAVEL] - WordPress Publisher - v1`
- `[TRAVEL] - Main Orchestrator - v2`

### 5. Node Organization

**Recommended Node Sequence:**
```
1. Trigger (Webhook/Form/Schedule)
2. Input Validation (Code node)
3. Cache Lookup (n8n Data Table)
4. Decision: Cache Valid? (IF node)
5. Fresh Data Fetch (HTTP Request + Gemini)
6. Data Transformation (Code node)
7. Image Processing (HTTP + Google Drive)
8. Save to Data Table (n8n Data Table)
9. Format Output (Code node)
10. Delivery (Webhook/Email/WordPress)
11. Logging (Google Sheets/n8n Data Table)
12. Notification (Telegram/Email - optional)
```

### 6. MCP Server Usage

**List Workflows:**
```bash
# Via n8n MCP server
Use mcp tool: n8n_list_workflows
```

**Create Workflow:**
```bash
# Via n8n MCP server
Use mcp tool: n8n_create_workflow
Provide: workflow JSON structure
```

**Execute Workflow:**
```bash
# Via n8n MCP server
Use mcp tool: n8n_execute_workflow
Provide: workflow_id, input_data
```

### 7. Testing Strategy

**Unit Testing (Per Node):**
- Test each node with sample data
- Verify output structure
- Check error handling

**Integration Testing (Full Flow):**
- Run workflow end-to-end with test data
- Verify all nodes execute successfully
- Check data persistence

**Edge Case Testing:**
- Missing data (no hotels found)
- API failures (rate limits, timeouts)
- Invalid input (malformed data)
- Cache expiry (stale data detection)

### 8. Performance Optimization

**Rate Limiting:**
- Add Wait nodes (2-5 seconds) between API calls
- Batch process large datasets (10-20 items per batch)
- Use cache to minimize API calls

**Parallel Processing:**
- Use Split In Batches node for parallelization
- Process independent items concurrently
- Merge results at the end

**Memory Management:**
- Clear large variables after use
- Stream data for large files
- Use sub-workflows to isolate memory

### 9. Security Best Practices

**Credentials Management:**
- Store all API keys in n8n Credentials
- Never hardcode secrets in workflows
- Use environment variables for URLs

**Webhook Security:**
- Use webhook secrets for authentication
- Validate all incoming data
- Implement rate limiting

**Data Privacy:**
- Don't log sensitive user data
- Anonymize logs where possible
- Respect GDPR/data residency requirements

### 10. Documentation Requirements

**For Each Workflow:**
- Purpose statement (1 sentence)
- Input/output schema
- Dependencies (credentials, other workflows)
- Error handling strategy
- Testing checklist

**For Sub-workflows:**
- Reusability notes
- Parameter documentation
- Return value documentation
- Usage examples

---

## Usage in Project

When building n8n workflows for travel content automation:

1. **Reference this skill** in shard instructions
2. **Use MCP tools** to create/manage workflows
3. **Follow naming conventions** for consistency
4. **Implement error handling** patterns
5. **Document each workflow** per guidelines
6. **Test thoroughly** before production

---

## Example Workflow References

See existing projects:
- `bits-bots-bytes` - Blog automation workflow
- `echo-travel` (v8.1) - Booking.com scraper (for reference, but lacks n8n skills usage)

---

**Skill Version:** 1.0
**Last Updated:** 2026-01-21
**Maintained By:** @Automator
