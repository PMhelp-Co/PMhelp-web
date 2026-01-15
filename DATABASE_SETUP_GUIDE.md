# Database Setup Guide - Quick Reference

## 📋 Setup Checklist

### Step 1: Create Tables
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy and paste entire `database_schema.sql` file
- [ ] Run the SQL script
- [ ] Verify all 12 tables are created
- [ ] Verify all indexes are created
- [ ] Verify all RLS policies are created

### Step 2: Create Storage Buckets

Go to **Storage** in Supabase dashboard and create:

| Bucket Name | Public/Private | Purpose |
|------------|----------------|---------|
| `course-thumbnails` | **Public** | Course icons & thumbnails |
| `lesson-videos` | **Private** | Course lesson videos (authenticated only) |
| `blog-images` | **Public** | Blog featured images & thumbnails |
| `avatars` | **Public** | User & author profile pictures |

**Storage Policies:**

For **public buckets** (course-thumbnails, blog-images, avatars):
```sql
-- Allow public read access
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
USING (bucket_id = 'bucket-name');
```

For **private buckets** (lesson-videos):
```sql
-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'lesson-videos'
  AND auth.role() = 'authenticated'
);
```

### Step 3: Verify RLS Policies

Test that RLS is working:

1. **Public Access Test:**
   - Without authentication, try to query published courses
   - Should succeed ✅

2. **Authenticated Access Test:**
   - Sign in as a user
   - Try to update your own profile
   - Should succeed ✅
   - Try to update another user's profile
   - Should fail ❌

3. **Admin Access Test:**
   - Sign in as admin user
   - Try to create/edit courses
   - Should succeed ✅

### Step 4: Create First Admin User

After creating a user account, manually set their role to admin:

```sql
-- Replace 'user-email@example.com' with actual email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'user-email@example.com'
);
```

Or via Supabase Dashboard:
1. Go to Authentication → Users
2. Find your user
3. Go to Database → profiles table
4. Edit the row and set `role = 'admin'`

---

## 🔍 Quick Reference: Table Relationships

```
profiles (users)
  ├── user_progress (user_id → profiles.id)
  └── course_feedback (user_id → profiles.id)

courses
  ├── lessons (course_id → courses.id)
  ├── course_learning_objectives (course_id → courses.id)
  ├── user_progress (course_id → courses.id)
  └── course_feedback (course_id → courses.id)

lessons
  └── user_progress (lesson_id → lessons.id)

authors
  └── blog_posts (author_id → authors.id)

blog_posts
  ├── blog_post_tags (blog_post_id → blog_posts.id)
  └── (related to blog_tags via blog_post_tags)

blog_tags
  └── blog_post_tags (tag_id → blog_tags.id)
```

---

## 📊 Common Queries

### Get all published courses
```sql
SELECT * FROM courses
WHERE is_published = true
ORDER BY order_index;
```

### Get course with lessons
```sql
SELECT 
  c.*,
  json_agg(l.*) as lessons
FROM courses c
LEFT JOIN lessons l ON l.course_id = c.id
WHERE c.slug = 'course-slug'
  AND c.is_published = true
  AND l.is_published = true
GROUP BY c.id;
```

### Get user progress for a course
```sql
SELECT 
  up.*,
  l.title as lesson_title,
  l.slug as lesson_slug
FROM user_progress up
JOIN lessons l ON l.id = up.lesson_id
WHERE up.user_id = 'user-uuid'
  AND up.course_id = 'course-uuid'
ORDER BY l.order_index;
```

### Get blog post with author and tags
```sql
SELECT 
  bp.*,
  a.name as author_name,
  a.avatar_url as author_avatar,
  json_agg(bt.name) as tags
FROM blog_posts bp
LEFT JOIN authors a ON a.id = bp.author_id
LEFT JOIN blog_post_tags bpt ON bpt.blog_post_id = bp.id
LEFT JOIN blog_tags bt ON bt.id = bpt.tag_id
WHERE bp.slug = 'post-slug'
  AND bp.is_published = true
GROUP BY bp.id, a.id;
```

---

## 🚨 Troubleshooting

### Issue: "Row Level Security policy violation"
**Solution:** Check that RLS policies are correctly set up. Make sure:
- RLS is enabled on the table
- Appropriate policies exist for your use case
- User has correct role/permissions

### Issue: "Foreign key constraint violation"
**Solution:** Ensure:
- Referenced record exists
- You're using correct UUID format
- Cascade delete is set up if needed

### Issue: "Cannot insert into profiles"
**Solution:** Create a trigger to auto-create profile on user signup:

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Issue: "Storage bucket not found"
**Solution:** 
- Verify bucket name is correct (case-sensitive)
- Check bucket exists in Storage dashboard
- Verify storage policies are set up

---

## 📝 Next Steps

After database setup:
1. ✅ Import CSV data (courses, lessons, blog posts, etc.)
2. ✅ Test API queries from frontend
3. ✅ Set up authentication
4. ✅ Connect frontend to Supabase

See `PROJECT_PLAN.md` for complete development roadmap.


