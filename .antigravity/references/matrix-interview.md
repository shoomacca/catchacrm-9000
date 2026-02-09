# Matrix Interview Protocol

The Matrix Interview is a structured questioning approach for gathering comprehensive project requirements.

## Principles

1. **One Section at a Time** - Never ask all questions at once
2. **Confirm Before Proceeding** - Summarize and verify after each section
3. **Use Archetype Questions** - Don't improvise, use archetype-specific questions
4. **Extract Actionable Requirements** - Every answer should inform the build

## Interview Flow

```
┌──────────────────────────────────────────────────────────┐
│                   MATRIX INTERVIEW                        │
│                                                          │
│   1. Detect Archetype                                    │
│      ↓                                                   │
│   2. Load Archetype Questions                            │
│      ↓                                                   │
│   3. For each section:                                   │
│      ├─ Present questions with options                   │
│      ├─ Collect answers                                  │
│      ├─ Summarize understanding                          │
│      └─ Confirm before next section                      │
│      ↓                                                   │
│   4. Recommend Stack                                     │
│      ↓                                                   │
│   5. Extract Requirements (v1/v2/out of scope)           │
│      ↓                                                   │
│   6. Plan Milestones                                     │
│      ↓                                                   │
│   7. Create Planning Files                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Question Format

Present questions with numbered options:

```markdown
## Section: Authentication & Users

Please answer these questions:

1. **Tenancy model?**
   a) Single-tenant
   b) Multi-tenant with RLS
   c) Hybrid

2. **User roles needed?**
   a) Simple (Admin, Member)
   b) Standard (Owner, Admin, Member, Viewer)
   c) Custom roles

3. **Social login?**
   a) None - email/password only
   b) Google only
   c) Multiple providers (Google, GitHub, etc.)

Reply with your choices (e.g., "1b, 2a, 3c")
```

## Confirmation Pattern

After each section:

```markdown
## Summary: Authentication & Users

Based on your answers:
- Multi-tenant with Row Level Security (RLS)
- Standard role hierarchy (Owner, Admin, Member, Viewer)
- Google social login only

**Is this correct?** (yes/no, or corrections)
```

## Archetype Detection

Match user description to one of 15 types:

| Type | Name | Signals |
|------|------|---------|
| 01 | B2B SaaS | Teams, subscriptions, billing |
| 02 | B2C SaaS | Individual users, freemium |
| 03 | Marketplace | Buyers + sellers, transactions |
| 04 | E-Commerce | Products, cart, checkout |
| 05 | Content Platform | Publishing, articles, media |
| 06 | Mobile App | iOS/Android, native features |
| 07 | API Service | Endpoints, rate limiting |
| 08 | Developer Tool | CLI, SDK, developers |
| 09 | AI Product | LLM, prompts, AI features |
| 10 | Internal Tool | Company use, admin dashboard |
| 11 | Landing Page | Marketing, waitlist |
| 12 | Portfolio | Personal site, projects |
| 13 | Browser Extension | Chrome/Firefox, popup |
| 14 | Automation | Workflows, bots, scripts |
| 15 | Game | Gameplay, scores, levels |

## Requirements Extraction

Categorize features from interview:

### v1 (MVP)
- Critical for launch
- User explicitly requested
- Core value proposition

### v2 (Post-Launch)
- Nice to have
- Can wait until after launch
- Enhancement features

### Out of Scope
- Explicitly not building
- Future consideration
- Different project

## Common Mistakes

1. **Asking all questions at once** - Overwhelming, leads to shallow answers
2. **Skipping confirmation** - Assumptions lead to wrong builds
3. **Using generic questions** - Archetype-specific questions yield better requirements
4. **Creating files early** - Complete full interview before any artifacts
5. **Assuming features** - If not discussed, ask
