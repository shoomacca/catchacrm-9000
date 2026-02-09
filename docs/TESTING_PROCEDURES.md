# Testing Procedures

This document contains manual testing procedures for CatchaCRM NG v11 features.

---

## Test: UpsertRecord Merge Behavior

**Test ID:** M02A_01_UPSERT_MERGE
**Priority:** P0 (Critical)
**Owner:** @Developer

### Setup

1. Hard reset CRM (Settings > Diagnostics > Hard Reset)
2. Verify seed data loaded

### Test Case 1: Edit Lead Without Losing Fields

**Objective:** Verify that editing a lead with partial modal data preserves all existing fields.

**Steps:**
1. Navigate to Leads list
2. Click on first lead (e.g., "John Doe")
3. Note the following fields in Details tab:
   - Email: [value]
   - Phone: [value]
   - Score: [value]
   - Estimated Value: [value]
   - Source: [value]
   - Avatar: [value]
   - Owner ID: [value]
4. Click "Edit Record" button
5. Change only the "Name" field (e.g., "John Doe Jr.")
6. Click "Save"
7. Refresh page (F5)
8. Verify all fields still present:
   - Email: [same value]
   - Phone: [same value]
   - Score: [same value]
   - Estimated Value: [same value]
   - Source: [same value]
   - Avatar: [same value]
   - Owner ID: [same value]

**Expected Result:** All fields preserved after edit
**Before Fix:** Email, phone, score, etc. are lost (set to undefined)
**After Fix:** All fields preserved correctly

### Test Case 2: Create New Lead

**Objective:** Verify that creating a new lead works correctly.

**Steps:**
1. Navigate to Leads list
2. Click "Create New Lead" button
3. Fill in Name, Company, Status, Campaign ID
4. Click "Save"
5. Open the newly created lead
6. Verify only the 4 filled fields are populated (expected - new record)

**Expected Result:** Only filled fields populated, no errors
**Status:** Works correctly (no regression)

### Test Case 3: Edit Multiple Times

**Objective:** Verify that multiple sequential edits preserve all data.

**Steps:**
1. Navigate to Leads list
2. Click on a lead with full data
3. Edit: Change name → Save
4. Refresh page
5. Edit: Change company → Save
6. Refresh page
7. Edit: Change status → Save
8. Refresh page
9. Verify all fields (email, phone, score, etc.) still present

**Expected Result:** All fields preserved across multiple edits
**After Fix:** All fields remain intact

---

## Test: Deal CRUD Operations

**Test ID:** M02A_03_DEAL_CRUD
**Priority:** P0 (Critical)
**Owner:** @Developer

*To be added in M02A_03 shard*

---

## Test: Account CRUD Operations

**Test ID:** M02A_04_ACCOUNT_CRUD
**Priority:** P0 (Critical)
**Owner:** @Developer

*To be added in M02A_04 shard*

---

## Test: Contact CRUD Operations

**Test ID:** M02A_05_CONTACT_CRUD
**Priority:** P0 (Critical)
**Owner:** @Developer

*To be added in M02A_05 shard*

---

## General Testing Guidelines

### Before Testing
- Always hard reset CRM to ensure clean state
- Verify seed data loaded correctly
- Check browser console for errors

### During Testing
- Test both create and edit operations
- Verify data persistence across page refreshes
- Check localStorage data if needed (DevTools > Application > Local Storage)
- Verify no console errors

### After Testing
- Document any unexpected behavior
- Create bug tickets for failures
- Update test procedures if new issues discovered

---

**Version:** 1.0
**Last Updated:** 2026-02-04
**Next Update:** After M02A_03 completion
