# Royalty-Free Game Engine Hub

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Engine discovery section: searchable/filterable list of royalty-free game engines (Godot, O3DE, Defold, Bevy, LÖVE2D, etc.) with features, platform support, licensing info, and ratings
- Tutorials & documentation section: guides organized by engine and skill level (beginner/intermediate/advanced), with bookmarking
- Asset sharing system: upload, browse, download free game assets organized by category (sprites, audio, 3D models, etc.)
- Community forum: discussion threads organized by engine-specific channels, with post creation and replies
- Project management: create projects, add tasks with status (todo/in-progress/done), milestones, and progress tracking
- Authorization system for user accounts
- Blob storage for asset uploads
- Sample content for all sections

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Engine catalog: CRUD for engine entries with metadata (name, description, features, platforms, license, website)
   - Tutorials: CRUD for tutorial entries with engine association, skill level, content, tags
   - Assets: metadata storage for uploaded assets (name, description, category, engine tags, uploader, download count); blob-storage for actual files
   - Community: channels per engine, discussion threads, replies
   - Projects: user projects with tasks (title, description, status, priority) and milestones
   - Authorization: user roles (admin, member)

2. Frontend:
   - Navigation with sidebar or top nav covering all 5 sections
   - Engine Hub page: search bar, filter chips, engine cards grid, detail modal
   - Tutorials page: filter by engine + skill level, tutorial cards, detail view
   - Assets page: upload form, asset grid with category filters, download action
   - Community page: channel list sidebar, thread list, thread detail with replies
   - Projects page: project list, kanban-style task board per project, milestone tracker
   - Dark developer-friendly theme throughout
   - Sample/seed data displayed on load
