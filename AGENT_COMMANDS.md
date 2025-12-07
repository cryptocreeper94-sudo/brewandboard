# Brew & Board Agent Commands

## PRE-PUBLISH SWEEP

Use this command before running the version bump. Copy and paste this entire block to any agent:

---

**COMMAND: PRE-PUBLISH SWEEP**

Before I bump the version and publish, perform a comprehensive pre-publish sweep of the Brew & Board Coffee platform. Complete ALL of the following tasks:

### 1. CONTENT & DOCUMENTATION UPDATES
- [ ] Update all business plans with current features and pricing
- [ ] Update business roadmaps with completed milestones and future plans
- [ ] Update executive summaries to reflect current state
- [ ] Update live business plan documents
- [ ] Review and update all user-facing modals (welcome modals, onboarding, tutorials)
- [ ] Update any slideshow/presentation templates with current info
- [ ] Update investor materials if applicable

### 2. USER EXPERIENCE
- [ ] Review all descriptive modals for accuracy and clarity
- [ ] Check tutorial content is up-to-date
- [ ] Verify onboarding flows work correctly
- [ ] Ensure all tooltips and help text are accurate

### 3. MOBILE OPTIMIZATION
- [ ] Test all pages for mobile responsiveness
- [ ] Check touch targets are appropriately sized (min 44px)
- [ ] Verify scrolling works properly on mobile
- [ ] Check modals and dialogs work on small screens
- [ ] Ensure footer and navigation work on mobile

### 4. ERROR CHECKING
- [ ] Run LSP diagnostics and fix any TypeScript errors
- [ ] Check browser console for JavaScript errors
- [ ] Verify all API endpoints return expected responses
- [ ] Test database connections are healthy
- [ ] Check for broken links or missing assets

### 5. TASK MANAGEMENT
- [ ] Review and clear completed todo items
- [ ] Update any pending checklists
- [ ] Document any known issues or technical debt

### 6. SYSTEM VERIFICATION
- [ ] Verify authentication flows work (all PIN types: 0424, 444, 777, 5555)
- [ ] Test critical user paths (login, order, portfolio)
- [ ] Check payment integrations are configured
- [ ] Verify email notifications are working
- [ ] Test hallmark/blockchain features

### 7. VERSION ALIGNMENT
- [ ] Ensure version references are consistent across the app
- [ ] Update changelog in replit.md with new features
- [ ] Document any breaking changes

After completing all checks, report:
1. Summary of updates made
2. Any issues found and fixed
3. Any issues that need manual attention
4. Confirmation the app is ready for version bump

---

## VERSION BUMP

After the pre-publish sweep is complete, run:

```bash
npx tsx scripts/bump-version.ts patch --hallmark
```

Options:
- `patch` - Bug fixes, small updates (1.2.3 → 1.2.4)
- `minor` - New features (1.2.3 → 1.3.0)
- `major` - Breaking changes (1.2.3 → 2.0.0)

---

## QUICK COMMANDS

### Mobile Check Only
"Check all pages for mobile responsiveness and fix any layout issues."

### Error Check Only
"Run diagnostics, check for TypeScript errors, console errors, and API issues. Fix anything found."

### Content Update Only
"Update all business documentation, modals, and user-facing content to reflect current features."

### System Health Only
"Verify all integrations, authentication, payments, and core features are working correctly."

---

## CURRENT VERSION INFO

Check `/api/version/tracking` for current version details or visit the Developer Hub Version Tracking panel.
