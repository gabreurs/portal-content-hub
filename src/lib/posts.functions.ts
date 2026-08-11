import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: undefined,
    },
  });
}

const postSelect = `
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image,
  featured,
  published,
  published_at,
  view_count,
  created_at,
  updated_at,
  category_id,
  author_id,
  categories:category_id (id, slug, name, color),
  authors:author_id (id, slug, name, avatar_url, role)
`;

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, color, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAuthors = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("authors")
    .select("id, slug, name, avatar_url, role")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getFeaturedPost = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("featured", true)
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
});

export const getLatestPosts = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        limit: z.number().default(12),
        excludeSlug: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("posts")
      .select(postSelect)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (data.excludeSlug) {
      query = query.neq("slug", data.excludeSlug);
    }

    const { data: posts, error } = await query;
    if (error) throw new Error(error.message);
    return posts ?? [];
  });

export const getMostReadPosts = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        limit: z.number().default(5),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: posts, error } = await supabase
      .from("posts")
      .select(postSelect)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("view_count", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error(error.message);
    return posts ?? [];
  });

export const getPostsByCategory = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        categorySlug: z.string(),
        limit: z.number().default(12),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, slug, name, color")
      .eq("slug", data.categorySlug)
      .eq("active", true)
      .single();

    if (categoryError || !category) {
      throw new Error("Categoria não encontrada");
    }

    const { data: posts, error } = await supabase
      .from("posts")
      .select(postSelect)
      .eq("category_id", category.id)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error(error.message);
    return { category, posts: posts ?? [] };
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        slug: z.string(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: post, error } = await supabase
      .from("posts")
      .select(postSelect)
      .eq("slug", data.slug)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .single();

    if (error || !post) {
      throw new Error("Notícia não encontrada");
    }

    return post;
  });

export const incrementViewCount = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.string(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: post } = await supabase
      .from("posts")
      .select("view_count")
      .eq("id", data.id)
      .single();

    const current = post?.view_count ?? 0;
    const { error } = await supabase
      .from("posts")
      .update({ view_count: current + 1 })
      .eq("id", data.id);

    if (error) {
      console.error(error);
    }
    return { ok: true };
  });

type PostInputData = {
  title: string;
  slug: string;
  excerpt?: string | undefined;
  content?: string | undefined;
  coverImage?: string | undefined;
  categoryId?: string | undefined;
  authorId?: string | undefined;
  featured: boolean;
  published: boolean;
  publishedAt?: string | undefined;
};

function toPostInput(data: PostInputData) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? null,
    content: data.content ?? null,
    cover_image: data.coverImage ?? null,
    category_id: data.categoryId ?? null,
    author_id: data.authorId ?? null,
    featured: data.featured,
    published: data.published,
    published_at: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
  };
}

async function requireEditorRole(context: {
  supabase: ReturnType<typeof createPublicClient>;
  userId: string;
}) {
  const [{ data: isAdmin }, { data: isEditor }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "editor" }),
  ]);
  if (!isAdmin && !isEditor) {
    throw new Error("Forbidden");
  }
}

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.string().optional(),
        authorId: z.string().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
        publishedAt: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await requireEditorRole(context);

    const { data: post, error } = await context.supabase
      .from("posts")
      .insert(toPostInput(data))
      .select(postSelect)
      .single();

    if (error) throw new Error(error.message);
    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string(),
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.string().optional(),
        authorId: z.string().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
        publishedAt: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await requireEditorRole(context);

    const { data: post, error } = await context.supabase
      .from("posts")
      .update({
        ...toPostInput(data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select(postSelect)
      .single();

    if (error) throw new Error(error.message);
    return post;
  });

export const getAllPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireEditorRole(context);

    const { data: posts, error } = await context.supabase
      .from("posts")
      .select(postSelect)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return posts ?? [];
  });

export const getPostByIdAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireEditorRole(context);

    const { data: post, error } = await context.supabase
      .from("posts")
      .select(postSelect)
      .eq("id", data.id)
      .single();

    if (error) throw new Error(error.message);
    return post;
  });
