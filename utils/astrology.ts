export type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
export type Polarity = "Yin" | "Yang";

export interface AstrologicalInfo {
  animal: string;
  element: string;
  polarity: string;
  modality: string;
  birthDate: string;
  hexagramId: number;
}

export interface AstrologyMetadata {
  animalSign: string;
  element: string;
  polarity: string;
  hexagramId: number;
}

const STEMS = [
  { name: "Geng", element: "Metal" as const, polarity: "Yang" as const },
  { name: "Xin", element: "Metal" as const, polarity: "Yin" as const },
  { name: "Ren", element: "Water" as const, polarity: "Yang" as const },
  { name: "Gui", element: "Water" as const, polarity: "Yin" as const },
  { name: "Jia", element: "Wood" as const, polarity: "Yang" as const },
  { name: "Yi", element: "Wood" as const, polarity: "Yin" as const },
  { name: "Bing", element: "Fire" as const, polarity: "Yang" as const },
  { name: "Ding", element: "Fire" as const, polarity: "Yin" as const },
  { name: "Wu", element: "Earth" as const, polarity: "Yang" as const },
  { name: "Ji", element: "Earth" as const, polarity: "Yin" as const },
] as const;

const ZODIAC_ANIMALS = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
] as const;

/**
 * 🔥 MASTER TABLE 64 HEXAGRAM
 * Berdasarkan data kamu (Animal + Element + Polarity)
 */
const HEXAGRAM_TABLE = [
  { id: 1, animal: "Horse", element: "Wood", polarity: "Yang" },
  { id: 2, animal: "Rat", element: "Wood", polarity: "Yang" },
  { id: 3, animal: "Rat", element: "Earth", polarity: "Yang" },
  { id: 4, animal: "Monkey", element: "Metal", polarity: "Yang" },
  { id: 5, animal: "Snake", element: "Wood", polarity: "Yin" },
  { id: 6, animal: "Goat", element: "Metal", polarity: "Yin" },
  { id: 7, animal: "Monkey", element: "Water", polarity: "Yang" },
  { id: 8, animal: "Pig", element: "Metal", polarity: "Yin" },
  { id: 9, animal: "Snake", element: "Fire", polarity: "Yin" },
  { id: 10, animal: "Dragon", element: "Earth", polarity: "Yang" },
  { id: 11, animal: "Dragon", element: "Metal", polarity: "Yang" },
  { id: 12, animal: "Dog", element: "Metal", polarity: "Yang" },
  { id: 13, animal: "Tiger", element: "Water", polarity: "Yang" },
  { id: 14, animal: "Snake", element: "Metal", polarity: "Yin" },
  { id: 15, animal: "Dog", element: "Earth", polarity: "Yang" },
  { id: 16, animal: "Pig", element: "Fire", polarity: "Yin" },
  { id: 17, animal: "Ox", element: "Fire", polarity: "Yin" },
  { id: 18, animal: "Goat", element: "Fire", polarity: "Yin" },
  { id: 19, animal: "Rabbit", element: "Wood", polarity: "Yin" },
  { id: 20, animal: "Pig", element: "Earth", polarity: "Yin" },
  { id: 21, animal: "Ox", element: "Wood", polarity: "Yin" },
  { id: 22, animal: "Ox", element: "Water", polarity: "Yin" }, // 🔥 Gui + Ox
  { id: 23, animal: "Pig", element: "Water", polarity: "Yin" },
  { id: 24, animal: "Rat", element: "Wood", polarity: "Yang" },
  { id: 25, animal: "Ox", element: "Earth", polarity: "Yin" },
  { id: 26, animal: "Dragon", element: "Water", polarity: "Yang" },
  { id: 27, animal: "Rat", element: "Fire", polarity: "Yang" },
  { id: 28, animal: "Horse", element: "Fire", polarity: "Yang" },
  { id: 29, animal: "Monkey", element: "Metal", polarity: "Yang" },
  { id: 30, animal: "Tiger", element: "Metal", polarity: "Yang" },
  { id: 31, animal: "Rooster", element: "Fire", polarity: "Yin" },
  { id: 32, animal: "Horse", element: "Metal", polarity: "Yang" },
  { id: 33, animal: "Rooster", element: "Wood", polarity: "Yin" },
  { id: 34, animal: "Snake", element: "Earth", polarity: "Yin" },
  { id: 35, animal: "Pig", element: "Wood", polarity: "Yin" },
  { id: 36, animal: "Ox", element: "Metal", polarity: "Yin" },
  { id: 37, animal: "Tiger", element: "Fire", polarity: "Yang" },
  { id: 38, animal: "Dragon", element: "Wood", polarity: "Yang" },
  { id: 39, animal: "Dog", element: "Wood", polarity: "Yang" },
  { id: 40, animal: "Monkey", element: "Fire", polarity: "Yang" },
  { id: 41, animal: "Rabbit", element: "Fire", polarity: "Yin" },
  { id: 42, animal: "Rat", element: "Metal", polarity: "Yang" },
  { id: 43, animal: "Snake", element: "Water", polarity: "Yin" },
  { id: 44, animal: "Horse", element: "Wood", polarity: "Yang" },
  { id: 45, animal: "Dog", element: "Water", polarity: "Yang" },
  { id: 46, animal: "Goat", element: "Earth", polarity: "Yin" },
  { id: 47, animal: "Goat", element: "Water", polarity: "Yin" },
  { id: 48, animal: "Goat", element: "Wood", polarity: "Yin" },
  { id: 49, animal: "Tiger", element: "Metal", polarity: "Yang" },
  { id: 50, animal: "Horse", element: "Earth", polarity: "Yang" },
  { id: 51, animal: "Rat", element: "Water", polarity: "Yang" },
  { id: 52, animal: "Dog", element: "Fire", polarity: "Yang" },
  { id: 53, animal: "Rooster", element: "Water", polarity: "Yin" },
  { id: 54, animal: "Rabbit", element: "Water", polarity: "Yin" },
  { id: 55, animal: "Tiger", element: "Earth", polarity: "Yang" },
  { id: 56, animal: "Rooster", element: "Earth", polarity: "Yin" },
  { id: 57, animal: "Horse", element: "Water", polarity: "Yang" },
  { id: 58, animal: "Dragon", element: "Fire", polarity: "Yang" },
  { id: 59, animal: "Monkey", element: "Earth", polarity: "Yang" },
  { id: 60, animal: "Rabbit", element: "Earth", polarity: "Yin" },
  { id: 61, animal: "Rabbit", element: "Metal", polarity: "Yin" },
  { id: 62, animal: "Rooster", element: "Metal", polarity: "Yin" },
  { id: 63, animal: "Tiger", element: "Wood", polarity: "Yang" },
  { id: 64, animal: "Monkey", element: "Wood", polarity: "Yang" },
] as const;

/**
 * AUTO GENERATE LOOKUP
 */
const HEXAGRAM_LOOKUP = Object.fromEntries(
  HEXAGRAM_TABLE.map((h) => [`${h.animal}-${h.element}-${h.polarity}`, h.id]),
);

/**
 * LICHUN
 */
export const getLichunDate = (year: number): number => {
  const Y = year % 100;
  const C = year >= 2000 ? 3.87 : 4.6295;
  return Math.floor(Y * 0.2422 + C) - Math.floor(Y / 4);
};

export function getChineseYear(date: Date): number {
  const year = date.getFullYear();
  const lichunDay = getLichunDate(year);
  const lichun = new Date(year, 1, lichunDay);
  return date < lichun ? year - 1 : year;
}

export function getStem(year: number) {
  const lastDigit = ((year % 10) + 10) % 10;
  return STEMS[lastDigit];
}

export function getAnimal(year: number): string {
  const idx = (((year - 4) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

export type ReadingResult = {
  year: number;
  stem: string;
  element: Element;
  polarity: Polarity;
  animal: string;
  hexagram: number | null;
};

export function getReading(date: Date): ReadingResult {
  const year = getChineseYear(date);
  const stem = getStem(year);
  const animal = getAnimal(year);

  const key = `${animal}-${stem.element}-${stem.polarity}`;
  const hexagram = HEXAGRAM_LOOKUP[key] ?? null;

  return {
    year,
    stem: stem.name,
    element: stem.element,
    polarity: stem.polarity,
    animal,
    hexagram,
  };
}

const ELEMENT_HAN: Record<Element, string> = {
  Metal: "金",
  Water: "水",
  Wood: "木",
  Fire: "火",
  Earth: "土",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parseYyyyMmDdLocal(
  dateOfBirth: string,
  birthTime?: string | null,
): Date | null {
  const dateParts = dateOfBirth.split("-");
  if (dateParts.length !== 3) return null;
  const year = parseInt(dateParts[0]!, 10);
  const month = parseInt(dateParts[1]!, 10);
  const day = parseInt(dateParts[2]!, 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }
  const d = new Date(year, month - 1, day);
  if (birthTime?.trim()) {
    const trimmed = birthTime.trim();
    if (trimmed.includes(":")) {
      const [hStr, mStr] = trimmed.split(":");
      const h = parseInt(hStr ?? "0", 10);
      const m = parseInt(mStr ?? "0", 10);
      if (Number.isFinite(h) && Number.isFinite(m)) {
        d.setHours(h, m, 0, 0);
      }
    }
  }
  return d;
}

const ELEMENTNAMES = ["Metal", "Water", "Wood", "Fire", "Earth"];

/**
 * Gabungan kalender + lookup hexagram (animal + element stem + polarity stem).
 */
export function getAstrologicalInfo(
  dateOfBirth: string,
  birthTime?: string | number | null,
): AstrologicalInfo | null {
  if (!dateOfBirth) return null;

  const timeStr =
    typeof birthTime === "number" && Number.isFinite(birthTime)
      ? `${String(birthTime).padStart(2, "0")}:00`
      : typeof birthTime === "string"
        ? birthTime
        : null;

  const parsed = parseYyyyMmDdLocal(dateOfBirth, timeStr);
  if (!parsed) return null;

  try {
    const reading = getReading(parsed);
    const han = ELEMENT_HAN[reading.element];
    const hexagramId = reading.hexagram ?? 1;

    const dateParts = dateOfBirth.split("-");
    const month = parseInt(dateParts[1]!, 10);
    const day = parseInt(dateParts[2]!, 10);
    const gy = parseInt(dateParts[0]!, 10);
    const formattedDate = `${MONTHS[month - 1]} ${day}, ${gy}`;

    return {
      animal: reading.animal,
      element: `${reading.element} ${han}`,
      polarity: reading.polarity === "Yang" ? "☯ Yang" : "☯ Yin",
      modality: reading.stem,
      birthDate: formattedDate,
      hexagramId,
    };
  } catch (error) {
    console.error("Error calculating astrological info:", error);
    return null;
  }
}

export function toAstrologyMetadata(info: AstrologicalInfo): AstrologyMetadata {
  const firstWord = info.animal.trim().split(/\s+/)[0] ?? "";
  const animalSign = (ZODIAC_ANIMALS as readonly string[]).includes(firstWord)
    ? firstWord
    : "Rat";

  const element =
    ELEMENTNAMES.find((n) => info.element.startsWith(n)) ??
    info.element.split(/\s/)[0] ??
    "Wood";

  const polarity = info.polarity.includes("Yang") ? "Yang" : "Yin";

  return {
    animalSign,
    element,
    polarity,
    hexagramId: info.hexagramId,
  };
}
