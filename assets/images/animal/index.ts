const animals = [
  require("./1.png"), // Rat
  require("./2.png"), // Ox
  require("./3.png"), // Tiger
  require("./4.png"), // Rabbit
  require("./5.png"), // Dragon
  require("./6.png"), // Snake
  require("./7.png"), // Horse
  require("./8.png"), // Goat
  require("./9.png"), // Monkey
  require("./10.png"), // Rooster
  require("./11.png"), // Dog
  require("./12.png"), // Pig
];

export const ANIMAL_SIGNS = [
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

export const getAnimalImage = (index: number) => animals[index] ?? animals[0];

export const getAnimalImageByName = (name: string) => {
  const i = ANIMAL_SIGNS.indexOf(name as (typeof ANIMAL_SIGNS)[number]);
  return getAnimalImage(i >= 0 ? i : 0);
};
