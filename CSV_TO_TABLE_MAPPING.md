# CSV to Database Table Mapping Guide

## 📊 Overview

You have **6 CSV files** that map to **12 database tables**. Here's the complete breakdown:

---

## ✅ CSV Files → Tables Mapping

### 1. **"Modules" CSV** → `courses` table
**Direct mapping:**
- CSV columns → Database columns
- `title` → `title`
- `slug` → `slug`
- `description` → `description`
- `thumbnail` or `icon` → `thumbnail_url` / `icon_url`
- `category` → `category`
- `order` → `order_index`
- `published` → `is_published`

**Note:** If your CSV has "What you'll learn" items, those go to `course_learning_objectives` table (see below).

---

### 2. **"Course lessons" CSV** → `lessons` table
**Direct mapping:**
- `title` → `title`
- `slug` → `slug`
- `course_slug` or `course_id` → `course_id` (need to lookup from courses table)
- `video_url` → `video_url`
- `content` → `content`
- `duration` → `duration`
- `order` → `order_index`
- `published` → `is_published`

---

### 3. **"Authors" CSV** → `authors` table
**Direct mapping:**
- `name` → `name`
- `slug` → `slug`
- `bio` → `bio`
- `avatar` or `avatar_url` → `avatar_url`

---

### 4. **"Blog Posts" CSV** → Multiple tables:

#### Primary: `blog_posts` table
- `title` → `title`
- `slug` → `slug`
- `excerpt` → `excerpt`
- `content` → `content`
- `featured_image` → `featured_image_url`
- `thumbnail_image` → `thumbnail_image_url`
- `author_slug` or `author_id` → `author_id` (need to lookup from authors table)
- `published_at` → `published_at`
- `published` → `is_published`

#### Secondary: `blog_tags` table (if tags column exists)
- Extract unique tags from CSV
- Create entries in `blog_tags` table

#### Tertiary: `blog_post_tags` table (relationship)
- Link blog posts to tags
- Create entries: `blog_post_id` + `tag_id`

**Example:** If Blog Posts CSV has a "tags" column like "Product Management, Strategy, Research"
- Create/use tags in `blog_tags`
- Create relationships in `blog_post_tags`

---

### 5. **"Content Sources" CSV** → `content_sources` table
**Direct mapping:**
- `creator` → `creator`
- `creator_image` → `creator_image`
- `module` or `module_slug` → `module_slug`
- `website` → `website_link`
- `instagram` → `instagram_link`
- `youtube` → `youtube_link`
- `twitter` → `twitter_link`
- `linkedin` → `linkedin_link`
- `facebook` → `facebook_link`
- `lessons` → `lessons` (comma-separated)
- `notes` → `notes`

---

### 6. **"Tags" CSV** (if separate) → `blog_tags` table
**Direct mapping:**
- `name` → `name`
- `slug` → `slug`

**Note:** If you don't have a separate Tags CSV, extract tags from Blog Posts CSV.

---

## ❌ Tables WITHOUT CSV Imports

These tables are created/managed differently:

### 1. `profiles` table
- **No CSV import**
- Created automatically when users sign up
- Extended from Supabase Auth

### 2. `course_learning_objectives` table
- **Might be in Modules CSV** (if you have a "learning_objectives" column)
- Or **manually created** after importing courses
- Format: If CSV has "What you'll learn" as comma-separated or JSON, parse and insert

### 3. `blog_post_tags` table
- **No direct CSV** (it's a relationship table)
- Created by linking `blog_posts` and `blog_tags`
- Extract from Blog Posts CSV "tags" column

### 4. `testimonials` table
- **No CSV mentioned**
- Likely needs **manual entry** or separate export
- Or create sample data for testing

### 5. `user_progress` table
- **No CSV import**
- Created dynamically as users complete lessons
- Starts empty

### 6. `course_feedback` table
- **No CSV import**
- Created dynamically when users submit feedback
- Starts empty

---

## 📋 Complete Mapping Summary

| CSV File | Primary Table | Secondary Tables | Notes |
|----------|--------------|------------------|-------|
| **Modules** | `courses` | `course_learning_objectives` | If CSV has learning objectives column |
| **Course lessons** | `lessons` | - | Need to map course_slug to course_id |
| **Authors** | `authors` | - | Direct mapping |
| **Blog Posts** | `blog_posts` | `blog_tags`, `blog_post_tags` | Extract tags and create relationships |
| **Content Sources** | `content_sources` | - | Direct mapping |
| **Tags** (if exists) | `blog_tags` | - | Direct mapping |

---

## 🔄 Import Process Flow

### Step 1: Import Base Tables (No Dependencies)
1. ✅ Import `authors` from "Authors" CSV
2. ✅ Import `blog_tags` from "Tags" CSV (or extract from Blog Posts)
3. ✅ Import `courses` from "Modules" CSV

### Step 2: Import Dependent Tables
4. ✅ Import `lessons` from "Course lessons" CSV
   - Map `course_slug` → `course_id` (lookup from courses table)
5. ✅ Import `blog_posts` from "Blog Posts" CSV
   - Map `author_slug` → `author_id` (lookup from authors table)
6. ✅ Import `content_sources` from "Content Sources" CSV

### Step 3: Create Relationships
7. ✅ Create `blog_post_tags` entries
   - Parse tags from Blog Posts CSV
   - Link to blog_posts and blog_tags

### Step 4: Handle Learning Objectives
8. ✅ Import `course_learning_objectives`
   - If in Modules CSV, parse and insert
   - Or create manually after courses are imported

### Step 5: Manual/Sample Data
9. ✅ Insert sample `testimonials` (if no CSV)
10. ✅ `user_progress` and `course_feedback` start empty (no import needed)

---

## 🛠️ Import Script Example Structure

```javascript
// Pseudo-code for import process

// 1. Import authors first (no dependencies)
importAuthors('Authors.csv') → authors table

// 2. Import courses (no dependencies)
importCourses('Modules.csv') → courses table
  // If CSV has learning objectives column:
  importLearningObjectives('Modules.csv') → course_learning_objectives table

// 3. Import blog tags (if separate CSV, or extract from Blog Posts)
importBlogTags('Tags.csv') → blog_tags table
// OR extract from Blog Posts CSV

// 4. Import lessons (depends on courses)
importLessons('Course lessons.csv') → lessons table
  // Map course_slug to course_id using courses table

// 5. Import blog posts (depends on authors)
importBlogPosts('Blog Posts.csv') → blog_posts table
  // Map author_slug to author_id using authors table

// 6. Create blog post tags relationships
importBlogPostTags('Blog Posts.csv') → blog_post_tags table
  // Extract tags column, link to blog_posts and blog_tags

// 7. Import content sources
importContentSources('Content Sources.csv') → content_sources table

// 8. Manual: Insert testimonials (if no CSV)
insertSampleTestimonials() → testimonials table
```

---

## ❓ Common Questions

### Q: What if my CSV column names don't match?
**A:** Create a mapping object in your import script:
```javascript
const columnMapping = {
  'CSV Column Name': 'database_column_name',
  'Module Title': 'title',
  'Module Slug': 'slug',
  // etc.
};
```

### Q: What if I have learning objectives in the Modules CSV?
**A:** Parse them (if comma-separated or JSON) and insert into `course_learning_objectives` table:
```javascript
// If CSV has: "Learn PM basics, Understand strategy, etc."
const objectives = row['learning_objectives'].split(',').map(o => o.trim());
// Insert each into course_learning_objectives with course_id
```

### Q: What if tags are in Blog Posts CSV as comma-separated?
**A:** 
1. Extract all unique tags
2. Insert into `blog_tags` table
3. Create relationships in `blog_post_tags` table

### Q: How do I map course_slug to course_id?
**A:** Create a lookup map:
```javascript
// After importing courses
const courseMap = {};
courses.forEach(course => {
  courseMap[course.slug] = course.id;
});

// When importing lessons
const courseId = courseMap[lessonRow.course_slug];
```

---

## 📝 Next Steps

1. ✅ Review your CSV files and verify column names
2. ✅ Create import scripts (Node.js, Python, or SQL)
3. ✅ Test import with sample data first
4. ✅ Verify relationships are correct
5. ✅ Check for missing data or errors

Need help creating the actual import scripts? Let me know which language you prefer (JavaScript/Node.js, Python, or SQL)!

