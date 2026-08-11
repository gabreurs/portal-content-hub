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
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

const columnistSelect =
  "id, slug, name, avatar_url, bio, role, headline, linkedin_url, instagram_url, sort_order, active, is_columnist";

const columnPostSelect = `
  id,
  title,
  slug,
  excerpt,
  cover_image,
  published_at,
  view_count,
  category_id,
  author_id,
  categories:category_id (id, slug, name, color),
  authors:author_id (id, slug, name, avatar_url, role)
`;

export const getColumnists = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("authors")
    .select(columnistSelect)
    .eq("is_columnist", true)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getColumnistBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: author, error } = await supabase
      .from("authors")
      .select(columnistSelect)
      .eq("slug", data.slug)
      .eq("is_columnist", true)
      .eq("active", true)
      .single();

    if (error || !author) {
      throw new Error("Colunista não encontrado");
    }

    const { data: posts } = await supabase
      .from("posts")
      .select(columnPostSelect)
      .eq("author_id", author.id)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(24);

    return { author, posts: posts ?? [] };
  });

export const getLatestColumns = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ limit: z.number().default(4) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: columnists } = await supabase
      .from("authors")
      .select("id")
      .eq("is_columnist", true)
      .eq("active", true);

    const ids = (columnists ?? []).map((c) => c.id);
    if (ids.length === 0) return [];

    const { data: posts, error } = await supabase
      .from("posts")
      .select(columnPostSelect)
      .in("author_id", ids)
      .eq("published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error(error.message);
    return posts ?? [];
  });

async function requireAdminRole(context: {
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

const columnistInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  role: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  isColumnist: z.boolean().default(true),
  active: z.boolean().default(true),
});

function toRow(data: z.infer<typeof columnistInput>) {
  return {
    name: data.name,
    slug: data.slug,
    role: data.role || null,
    headline: data.headline || null,
    bio: data.bio || null,
    avatar_url: data.avatarUrl || null,
    linkedin_url: data.linkedinUrl || null,
    instagram_url: data.instagramUrl || null,
    sort_order: data.sortOrder,
    is_columnist: data.isColumnist,
    active: data.active,
  };
}

export const getAllColumnistsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminRole(context);
    const { data, error } = await context.supabase
      .from("authors")
      .select(columnistSelect)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createColumnist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => columnistInput.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdminRole(context);
    const { data: author, error } = await context.supabase
      .from("authors")
      .insert(toRow(data))
      .select(columnistSelect)
      .single();

    if (error) throw new Error(error.message);
    return author;
  });

export const updateColumnist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => columnistInput.extend({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdminRole(context);
    const { id, ...rest } = data;
    const { data: author, error } = await context.supabase
      .from("authors")
      .update(toRow(rest))
      .eq("id", id)
      .select(columnistSelect)
      .single();

    if (error) throw new Error(error.message);
    return author;
  });

export const deleteColumnist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdminRole(context);
    const { error } = await context.supabase.from("authors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
