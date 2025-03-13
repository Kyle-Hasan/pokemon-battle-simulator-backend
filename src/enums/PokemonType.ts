import { registerEnumType } from "type-graphql";

export enum PokemonType {
    Normal = "normal",
    Fire= "fire",
    Water = "water",
    Electric = "electric",
    Grass = "grass",
    Ice = "ice",
    Fighting = "fighting",
    Poison = "poison",
    Ground = "ground",
    Flying = "flying",
    Psychic = "psychic",
    Bug = "bug",
    Rock = "rock",
    Ghost = "ghost",
    Dragon = "dragon",
    Dark = "dark",
    Steel = "steel",
    Fairy = "fairy",
  }
  registerEnumType(PokemonType, {
    name: "PokemonType",
    description: "Type of a Pokémon/move.",
  });