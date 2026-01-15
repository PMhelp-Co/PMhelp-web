-- =====================================================
-- PMHelp Website - Complete Database Schema
-- =====================================================
-- This file contains all CREATE TABLE statements
-- ready to paste into Supabase SQL Editor
-- =====================================================
-- Created: Based on corrected Phase 2 schema
-- Compatible with: Webflow CSV exports
-- =====================================================

-- =====================================================
-- 1. PROFILES (Extends Supabase Auth)
-- =====================================================
-- All users — students, admins, instructors
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'student', -- student, admin, instructor
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- =====================================================
-- 2. COURSES (Main course catalog)
-- =====================================================
-- Matches Webflow Modules CSV
-- =====================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  icon_url TEXT,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for courses
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_order ON courses(order_index);

-- =====================================================
-- 3. LESSONS (Individual lessons within courses)
-- =====================================================
-- Maps 1 course → many lessons
-- Matches "Course lessons.csv"
-- =====================================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  video_url TEXT,
  content TEXT,
  duration INTEGER,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- Indexes for lessons
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);

-- =====================================================
-- 4. COURSE LEARNING OBJECTIVES
-- =====================================================
-- "What you'll learn" items for each course
-- =====================================================

CREATE TABLE course_learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  objective_text TEXT NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for learning objectives
CREATE INDEX idx_objectives_course_id ON course_learning_objectives(course_id);
CREATE INDEX idx_objectives_order ON course_learning_objectives(course_id, order_index);

-- =====================================================
-- 5. AUTHORS (Blog Authors Only)
-- =====================================================
-- Separate from profiles - for blog authors
-- who may not be app users
-- =====================================================

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for authors
CREATE INDEX idx_authors_slug ON authors(slug);

-- =====================================================
-- 6. BLOG POSTS
-- =====================================================
-- Blog post content
-- Matches "Blog Posts" CSV export
-- =====================================================

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  thumbnail_image_url TEXT,
  author_id UUID REFERENCES authors(id),
  published_at TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for blog posts
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- =====================================================
-- 7. BLOG TAGS
-- =====================================================
-- Tags for blog posts
-- =====================================================

CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for blog tags
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- =====================================================
-- 8. BLOG POST TAGS (Many-to-Many)
-- =====================================================
-- Links blog posts to tags
-- =====================================================

CREATE TABLE blog_post_tags (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, tag_id)
);

-- Indexes for blog post tags
CREATE INDEX idx_post_tags_post_id ON blog_post_tags(blog_post_id);
CREATE INDEX idx_post_tags_tag_id ON blog_post_tags(tag_id);

-- =====================================================
-- 9. CONTENT SOURCES
-- =====================================================
-- Content sources/creators
-- Matches "Content Sources" CSV structure
-- =====================================================

CREATE TABLE content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator TEXT NOT NULL,
  creator_image TEXT,
  module_slug TEXT,
  website_link TEXT,
  instagram_link TEXT,
  youtube_link TEXT,
  twitter_link TEXT,
  linkedin_link TEXT,
  facebook_link TEXT,
  lessons TEXT, -- comma-separated slugs
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for content sources
CREATE INDEX idx_content_sources_module ON content_sources(module_slug);

-- =====================================================
-- 10. TESTIMONIALS
-- =====================================================
-- User testimonials for social proof
-- =====================================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  testimonial_text TEXT NOT NULL,
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for testimonials
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- =====================================================
-- 11. USER PROGRESS
-- =====================================================
-- Track user course progress
-- =====================================================

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes for user progress
CREATE INDEX idx_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_progress_user_course ON user_progress(user_id, course_id);

-- =====================================================
-- 12. COURSE FEEDBACK
-- =====================================================
-- Feedback forms for courses
-- =====================================================

CREATE TABLE course_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER, -- 1-5 stars
  valuable_feedback TEXT,
  improvement_feedback TEXT,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for course feedback
CREATE INDEX idx_feedback_course_id ON course_feedback(course_id);
CREATE INDEX idx_feedback_user_id ON course_feedback(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_feedback ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES
-- =====================================================
-- Anyone can read published content
-- =====================================================

-- Courses: Public can read published courses
CREATE POLICY "Public can read published courses"
ON courses FOR SELECT
USING (is_published = true);

-- Lessons: Public can read published lessons
CREATE POLICY "Public can read published lessons"
ON lessons FOR SELECT
USING (is_published = true);

-- Course Learning Objectives: Public can read (for published courses)
CREATE POLICY "Public can read learning objectives"
ON course_learning_objectives FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_learning_objectives.course_id
    AND courses.is_published = true
  )
);

-- Authors: Public can read all
CREATE POLICY "Public can read authors"
ON authors FOR SELECT
USING (true);

-- Blog Posts: Public can read published posts
CREATE POLICY "Public can read published blog posts"
ON blog_posts FOR SELECT
USING (is_published = true);

-- Blog Tags: Public can read all
CREATE POLICY "Public can read blog tags"
ON blog_tags FOR SELECT
USING (true);

-- Blog Post Tags: Public can read all
CREATE POLICY "Public can read blog post tags"
ON blog_post_tags FOR SELECT
USING (true);

-- Content Sources: Public can read all
CREATE POLICY "Public can read content sources"
ON content_sources FOR SELECT
USING (true);

-- Testimonials: Public can read all
CREATE POLICY "Public can read testimonials"
ON testimonials FOR SELECT
USING (true);

-- =====================================================
-- AUTHENTICATED USER POLICIES
-- =====================================================
-- Users can manage their own data
-- =====================================================

-- Profiles: Users can read all, update only their own
CREATE POLICY "Users can read all profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- User Progress: Users can read/write their own progress
CREATE POLICY "Users can read own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Course Feedback: Authenticated users can insert
CREATE POLICY "Authenticated users can submit feedback"
ON course_feedback FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read own feedback"
ON course_feedback FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- =====================================================
-- ADMIN POLICIES
-- =====================================================
-- Admins can manage all content
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can manage courses
CREATE POLICY "Admins can manage courses"
ON courses FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage lessons
CREATE POLICY "Admins can manage lessons"
ON lessons FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage learning objectives
CREATE POLICY "Admins can manage learning objectives"
ON course_learning_objectives FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage authors
CREATE POLICY "Admins can manage authors"
ON authors FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage blog posts
CREATE POLICY "Admins can manage blog posts"
ON blog_posts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage blog tags
CREATE POLICY "Admins can manage blog tags"
ON blog_tags FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage content sources
CREATE POLICY "Admins can manage content sources"
ON content_sources FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON testimonials FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Admin can read all user progress
CREATE POLICY "Admins can read all progress"
ON user_progress FOR SELECT
USING (is_admin());

-- Admin can read all feedback
CREATE POLICY "Admins can read all feedback"
ON course_feedback FOR SELECT
USING (is_admin());

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION
-- =====================================================
-- All tables, indexes, policies, and triggers created
-- =====================================================

