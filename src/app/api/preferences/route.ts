import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserPreferences, DefaultFilters } from "@/types/preferences";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine for new users
      // 42P01 = table doesn't exist
      if (error.code === "42P01") {
        console.warn("[Preferences] user_preferences table not found. Run the migration.");
      }
      // Return defaults instead of failing
      return NextResponse.json({
        data: {
          id: "",
          user_id: user.id,
          favourite_leagues: [],
          default_filters: {},
          created_at: "",
          updated_at: "",
        } satisfies UserPreferences,
      });
    }

    // Return existing preferences or defaults for new users
    const preferences: UserPreferences = data ?? {
      id: "",
      user_id: user.id,
      favourite_leagues: [],
      default_filters: {},
      created_at: "",
      updated_at: "",
    };

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error("[API /preferences GET] Error:", error);
    // Return safe defaults rather than 500
    return NextResponse.json({
      data: {
        id: "",
        user_id: "",
        favourite_leagues: [],
        default_filters: {},
        created_at: "",
        updated_at: "",
      },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { favourite_leagues, default_filters } = body as {
      favourite_leagues?: number[];
      default_filters?: DefaultFilters;
    };

    // Upsert preferences (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          ...(favourite_leagues !== undefined && { favourite_leagues }),
          ...(default_filters !== undefined && { default_filters }),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[API /preferences PUT] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API /preferences PUT] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
