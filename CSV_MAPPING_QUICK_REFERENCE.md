# CSV to Tables - Quick Reference

## 📊 Simple Mapping

```
6 CSV Files → 12 Database Tables
```

---

## ✅ CSV Files → Tables

| # | CSV File | → | Database Table(s) |
|---|---------|---|-------------------|
| 1 | **Modules.csv** | → | `courses` (+ `course_learning_objectives` if included) |
| 2 | **Course lessons.csv** | → | `lessons` |
| 3 | **Authors.csv** | → | `authors` |
| 4 | **Blog Posts.csv** | → | `blog_posts` + `blog_tags` + `blog_post_tags` |
| 5 | **Content Sources.csv** | → | `content_sources` |
| 6 | **Tags.csv** (if exists) | → | `blog_tags` |

---

## ❌ Tables WITHOUT CSV (Created Dynamically)

| Table | How It's Created |
|-------|------------------|
| `profiles` | Auto-created when users sign up |
| `course_learning_objectives` | From Modules CSV OR manually created |
| `blog_post_tags` | Created by linking blog_posts + blog_tags |
| `testimonials` | Manual entry (no CSV) |
| `user_progress` | Created as users complete lessons |
| `course_feedback` | Created when users submit feedback |

---

## 🔄 Import Order (Important!)

```
1. authors          ← Authors.csv
2. blog_tags        ← Tags.csv OR extract from Blog Posts.csv
3. courses          ← Modules.csv
4. lessons          ← Course lessons.csv (needs courses first!)
5. blog_posts       ← Blog Posts.csv (needs authors first!)
6. blog_post_tags   ← Extract from Blog Posts.csv (needs both blog_posts + blog_tags)
7. content_sources  ← Content Sources.csv
8. course_learning_objectives ← From Modules.csv OR manual
9. testimonials     ← Manual entry (no CSV)
```

---

## 💡 Key Points

- **6 CSV files** import into **6-8 tables** (some create multiple tables)
- **4 tables** are created dynamically (no CSV needed)
- **Import order matters!** (lessons need courses, blog_posts need authors, etc.)

See `CSV_TO_TABLE_MAPPING.md` for detailed mapping and import scripts.

