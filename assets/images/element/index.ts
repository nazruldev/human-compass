const elements = [
  require("./wood.png"),
  require("./fire.png"),
  require("./earth.png"),
  require("./metal.png"),
  require("./water.png"),
];

export const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

export const getElementImage = (index: number) =>
  elements[index] ?? elements[0];

export const getElementImageByName = (name: string) => {
  const i = ELEMENTS.indexOf(name as (typeof ELEMENTS)[number]);
  return getElementImage(i >= 0 ? i : 0);
};
