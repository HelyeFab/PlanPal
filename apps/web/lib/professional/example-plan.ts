/**
 * Seed factories for the plan builder.
 *
 * Example content is real plan *data* (a plan is authored in one language —
 * `plan.language`), so it lives here as a typed, locale-keyed dataset rather
 * than in the UI message files. Ids are deterministic so server and client
 * render the same initial HTML (no hydration mismatch).
 */
import type { BuilderMeal, BuilderState } from "./types";
import type { FoodUnit, SupportedLocale } from "@planpal/shared";

/** An empty plan in the given language — the starting point for a fresh client. */
export function createEmptyState(locale: SupportedLocale): BuilderState {
  return {
    client: { name: "", note: "" },
    preferredLanguage: locale,
    plan: { title: "", status: "draft", notes: "", language: locale },
    meals: [],
  };
}

type OptionSeed = [
  id: string,
  foodName: string,
  quantity: number,
  unit: FoodUnit,
  isDefault: boolean,
];

function optionsFrom(seeds: OptionSeed[]) {
  return seeds.map(([id, foodName, quantity, unit, isDefault]) => ({
    id,
    foodName,
    quantity,
    unit,
    notes: "",
    isDefault,
  }));
}

type ExampleCopy = {
  clientName: string;
  clientNote: string;
  planTitle: string;
  planNotes: string;
  proteinLabel: string;
  fruitLabel: string;
  carbLabel: string;
  meals: BuilderMeal[];
};

function buildMeals(c: {
  protein: string;
  fruit: string;
  carb: string;
  yogurt: string;
  eggWhites: string;
  berries: string;
  banana: string;
  rice: string;
  pasta: string;
  chicken: string;
  tofu: string;
}): BuilderMeal[] {
  return [
    {
      id: "ex_meal_breakfast",
      name: "breakfast",
      displayName: "",
      timeLabel: "07:30",
      notes: "",
      slots: [
        {
          id: "ex_slot_bf_protein",
          label: c.protein,
          category: "protein",
          required: true,
          notes: "",
          options: optionsFrom([
            ["ex_opt_bf_protein_1", c.yogurt, 170, "g", true],
            ["ex_opt_bf_protein_2", c.eggWhites, 150, "g", false],
          ]),
        },
        {
          id: "ex_slot_bf_fruit",
          label: c.fruit,
          category: "fruit",
          required: false,
          notes: "",
          options: optionsFrom([
            ["ex_opt_bf_fruit_1", c.berries, 80, "g", true],
            ["ex_opt_bf_fruit_2", c.banana, 1, "piece", false],
          ]),
        },
      ],
    },
    {
      id: "ex_meal_lunch",
      name: "lunch",
      displayName: "",
      timeLabel: "13:00",
      notes: "",
      slots: [
        {
          id: "ex_slot_lunch_carb",
          label: c.carb,
          category: "carbohydrate",
          required: true,
          notes: "",
          options: optionsFrom([
            ["ex_opt_lunch_carb_1", c.rice, 80, "g", true],
            ["ex_opt_lunch_carb_2", c.pasta, 80, "g", false],
          ]),
        },
        {
          id: "ex_slot_lunch_protein",
          label: c.protein,
          category: "protein",
          required: true,
          notes: "",
          options: optionsFrom([
            ["ex_opt_lunch_protein_1", c.chicken, 150, "g", true],
            ["ex_opt_lunch_protein_2", c.tofu, 200, "g", false],
          ]),
        },
      ],
    },
  ];
}

const COPY: Record<SupportedLocale, ExampleCopy> = {
  en: {
    clientName: "Maria Rossi",
    clientNote: "Prefers simple breakfasts.",
    planTitle: "Spring nutrition plan",
    planNotes: "Higher protein at breakfast, lighter evenings.",
    proteinLabel: "Protein",
    fruitLabel: "Fruit",
    carbLabel: "Carbohydrate",
    meals: buildMeals({
      protein: "Protein",
      fruit: "Fruit",
      carb: "Carbohydrate",
      yogurt: "Greek yogurt",
      eggWhites: "Egg whites",
      berries: "Mixed berries",
      banana: "Banana",
      rice: "Brown rice",
      pasta: "Wholewheat pasta",
      chicken: "Chicken breast",
      tofu: "Tofu",
    }),
  },
  it: {
    clientName: "Maria Rossi",
    clientNote: "Preferisce colazioni semplici.",
    planTitle: "Piano alimentare primavera",
    planNotes: "Più proteine a colazione, sere più leggere.",
    proteinLabel: "Proteine",
    fruitLabel: "Frutta",
    carbLabel: "Carboidrati",
    meals: buildMeals({
      protein: "Proteine",
      fruit: "Frutta",
      carb: "Carboidrati",
      yogurt: "Yogurt greco",
      eggWhites: "Albumi",
      berries: "Frutti di bosco",
      banana: "Banana",
      rice: "Riso integrale",
      pasta: "Pasta integrale",
      chicken: "Petto di pollo",
      tofu: "Tofu",
    }),
  },
};

/** A populated example plan authored in `locale`, used by "Load example". */
export function createExamplePlan(locale: SupportedLocale): BuilderState {
  const c = COPY[locale];
  return {
    client: { name: c.clientName, note: c.clientNote },
    preferredLanguage: locale,
    plan: {
      title: c.planTitle,
      status: "draft",
      notes: c.planNotes,
      language: locale,
    },
    meals: c.meals,
  };
}
