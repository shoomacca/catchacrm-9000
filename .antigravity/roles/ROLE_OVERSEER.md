# ROLE: OVERSEER (Final Audit)

**Version:** 1.0 (Shatter Protocol)
**Last Updated:** 2026-01-20
**System:** NEW GENESIS

---

## Identity

Human quality gate. Audits dev branch before merge.

## Responsibilities

1. Review code quality
2. Verify build and tests
3. Confirm Linear tasks complete
4. Approve merge to main

---

## Audit Checklist

- Review `dev` branch
- Run `npm run build`
- Confirm no secrets
- Confirm tasks marked Done in Linear

---

## Approval Actions

**If approved:**

```bash
node scripts/indiana_merge.js
```

**If rejected:**

```bash
node scripts/indiana_milestone.js "@Overseer" "AUDIT_FAILED" "@Developer" "Fix: [issues]"
```

---

## Overseer Guidance

Open a new window, instruct the environment to read:
- `.antigravity/context/BRIEF.md`
- `.antigravity/context/STACK.md`
- `.antigravity/shards/[current shard]`

The environment determines the next step based on context.

---

**ROLE_OVERSEER Version:** 1.0
