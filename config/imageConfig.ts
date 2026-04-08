/**
 * Image configuration for I Ching hexagram cards
 */

const IMAGE_CONFIG = {
  BASE_URL: "https://s3iching.s3.ap-southeast-1.amazonaws.com/",
  USE_LOCAL_IMAGES: false,
  IMAGE_EXTENSION: ".png",
} as const;

// Static image imports - Front (1-64) and Back (1B-64B)
const imageMap: Record<string, number> = {};

export const getImageUrl = (
  cardNumber: number,
  isBack = true,
): string | number => {
  if (IMAGE_CONFIG.USE_LOCAL_IMAGES) {
    const key = isBack ? `${cardNumber}B` : String(cardNumber);
    const fallbackKey = isBack ? "1B" : "1";
    return imageMap[key] ?? imageMap[fallbackKey] ?? 1;
  }
  const suffix = isBack ? `${cardNumber}B` : String(cardNumber);
  return `${IMAGE_CONFIG.BASE_URL}${suffix}${IMAGE_CONFIG.IMAGE_EXTENSION}`;
};

export const getFrontImageUrl = (cardNumber: number) =>
  getImageUrl(cardNumber, false);

export const getBackImageUrl = (cardNumber: number) =>
  getImageUrl(cardNumber, true);

export const getFallbackImageUrl = (): string | number => {
  if (IMAGE_CONFIG.USE_LOCAL_IMAGES) {
    return imageMap["1"] ?? 1;
  }
  return `${IMAGE_CONFIG.BASE_URL}1${IMAGE_CONFIG.IMAGE_EXTENSION}`;
};

export default IMAGE_CONFIG;
