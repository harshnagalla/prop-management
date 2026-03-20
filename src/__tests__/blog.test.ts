import { describe, it, expect } from "vitest";
import { blogPosts, getBlogPost, getAllBlogSlugs } from "@/lib/blog";

describe("Blog", () => {
  describe("blogPosts", () => {
    it("has at least 5 posts", () => {
      expect(blogPosts.length).toBeGreaterThanOrEqual(5);
    });

    it("each post has required fields", () => {
      for (const post of blogPosts) {
        expect(post.slug).toBeTruthy();
        expect(post.title).toBeTruthy();
        expect(post.excerpt).toBeTruthy();
        expect(post.content).toBeTruthy();
        expect(post.date).toBeTruthy();
        expect(post.readTime).toBeTruthy();
        expect(post.category).toBeTruthy();
      }
    });

    it("slugs are unique", () => {
      const slugs = blogPosts.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("content is substantial", () => {
      for (const post of blogPosts) {
        const wordCount = post.content.split(/\s+/).length;
        expect(wordCount).toBeGreaterThan(100);
      }
    });
  });

  describe("getBlogPost", () => {
    it("returns a post for valid slug", () => {
      const slug = blogPosts[0].slug;
      const post = getBlogPost(slug);
      expect(post).toBeDefined();
      expect(post?.title).toBeTruthy();
    });

    it("returns undefined for invalid slug", () => {
      expect(getBlogPost("nonexistent-slug-12345")).toBeUndefined();
    });
  });

  describe("getAllBlogSlugs", () => {
    it("returns all slugs", () => {
      const slugs = getAllBlogSlugs();
      expect(slugs.length).toBe(blogPosts.length);
    });
  });
});
