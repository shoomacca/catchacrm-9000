# CatchaCRM - System Terminology & Architectural Patterns

**Version:** 1.0
**Last Updated:** 2026-02-08
**Purpose:** Define the universal language and architectural patterns used throughout the CatchaCRM codebase

---

## Core Architectural Concepts

### The Mock Data Layer
**Term:** Mock Data Layer (MDL)
**Location:** `src/context/CRMContext.tsx`
**Purpose:** In-memory localStorage-backed persistence layer that simulates a production database

**Key Characteristics:**
- All data stored in localStorage under `catchacrm_db_v3`
- State managed via React Context with 30+ entity collections
- Supports CRUD operations, relationships, and business logic hooks
- Enables full offline-first development without backend dependency

**Pattern:**
```typescript
const { leads, deals, settings } = useCRM();
// All entity collections are arrays synced to localStorage
```

---

### The Control Plane
**Term:** Control Plane
**Component:** `src/pages/SettingsView.tsx`
**Purpose:** Enterprise configuration management system that governs application behavior

**Terminology:**
- **Settings Domain:** Logical grouping of configuration (e.g., GENERAL, MODULES, INTEGRATIONS)
- **Control Surface:** UI elements (toggles, inputs) that modify settings state
- **Configuration State:** The `settings` object in CRMContext that persists to MDL
- **Reactive Binding:** Settings changes that immediately affect UI visibility, permissions, or logic

**Control Plane Domains:**
1. **Identity Engine** (GENERAL tab) - Organization branding and localization
2. **Feature Gate Matrix** (MODULES tab) - Module visibility flags
3. **Access Control Matrix** (USERS_ACCESS tab) - RBAC permissions
4. **Integration Hub** (INTEGRATIONS tab) - Third-party service configuration
5. **Automation Engine** (AUTOMATION tab) - Workflow and webhook settings
6. **Domain Config** (DOMAIN_CONFIG tab) - Module-specific business rules
7. **Diagnostics Center** (DIAGNOSTICS tab) - System health and audit logs

---

## Summary

**Control Plane** = Settings management system
**Mock Data Layer** = localStorage-backed state persistence
**Flash UI** = Visual design language (rounded, bold, spacious)
**Feature Flag** = Module visibility toggle
**RBAC** = Role-based permission system

Use these terms consistently in code, comments, documentation, and team communication.
