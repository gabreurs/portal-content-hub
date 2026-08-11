import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkHasAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { count, error } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw new Error(error.message);
  return { hasAdmin: (count ?? 0) > 0 };
});

const firstAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) => firstAdminSchema.parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const { count, error: countError } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("Já existe um administrador no sistema.");

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!authData.user) throw new Error("Erro ao criar usuário.");

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: "admin",
    });

    if (roleError) throw new Error(roleError.message);

    return { ok: true, userId: authData.user.id };
  });
