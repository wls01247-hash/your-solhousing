import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export interface ListingDTO {
  uid: number;
  title: string | null;
  address: string | null;
  station_name: string | null;
  station_line: string | null;
  walk_minutes: number | null;
  rent_yen: number | null;
  maintenance_fee_yen: number | null;
  room_type: string | null;
  size_sqm: number | null;
  image_url: string | null;
  property_url: string;
}

const inputSchema = z.object({
  type: z.enum(["MOVE", "SAVE", "LIFE", "HOME", "MOVE_LIFE", "SAVE_HOME", "MOVE_HOME", "LIFE_HOME"]),
  limit: z.number().int().min(1).max(20).optional(),
});

export const getRecommendedListings = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ListingDTO[]> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: rows, error } = await supabase
      .from("recommended_listings")
      .select(
        "uid, title, address, station_name, station_line, walk_minutes, rent_yen, maintenance_fee_yen, room_type, size_sqm, image_url, property_url",
      )
      .eq("type_slug", data.type)
      .order("updated_at", { ascending: false })
      .limit(data.limit ?? 3);

    if (error) {
      console.error("[getRecommendedListings]", error);
      return [];
    }
    return (rows ?? []) as ListingDTO[];
  });