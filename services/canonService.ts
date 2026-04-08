import { supabase } from "@/utils/supabase";

export type CanonType = "upper" | "lower";

export type CanonRow = {
  id?: string | number;
  type: CanonType | string;
  bucket?: string | null;
  path?: string | null;
  description?: string | null;
  [key: string]: unknown;
};

export type CanonItem = CanonRow & {
  image: string;
};

async function getCanonByType(type: CanonType): Promise<CanonItem[]> {
  const { data, error } = await supabase
    .from("canon")
    .select("*")
    .eq("type", type);

  if (error) throw error;

  const rows = (data ?? []) as CanonRow[];

  return rows.map((item) => {
    const bucket = item.bucket ?? undefined;
    const path = item.path ?? undefined;

    const publicUrl =
      bucket && path
        ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
        : "";

    return {
      ...item,
      image: publicUrl,
    };
  });
}

export const getUpperCanon = async (): Promise<CanonItem[]> => {
  return getCanonByType("upper");
};

export const getLowerCanon = async (): Promise<CanonItem[]> => {
  return getCanonByType("lower");
};
