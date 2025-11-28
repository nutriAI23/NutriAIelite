
export enum UserGoal {
  LOSE_WEIGHT = 'Perder Peso',
  GAIN_MUSCLE = 'Ganhar Massa Muscular',
  MAINTAIN = 'Manter Peso',
  HEALTH = 'Saúde Geral'
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  goal: UserGoal;
  restrictions: string;
  preferences: string;
  mealsPerDay: number;
  onboarded: boolean;
}

export interface Meal {
  mealName: string; // e.g., "Café da Manhã", "Almoço"
  recipeName: string;
  calories: number;
  instructions: string[];
  ingredients: string[];
  nutritionalInfo: string;
  imageBase64?: string; // Generated image
}

export interface DailyMealPlan {
  type: 'Normal' | 'Custo-Benefício';
  aiAnalysis: string;
  meals: Meal[];
}

export interface DailyTip {
  foodRecipe: { title: string; description: string };
  drinkRecipe: { title: string; description: string };
  wellnessTip: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface WorkoutAnalysis {
  muscleMain: string;
  muscleSec: string;
  tip: string;
}

export interface FoodAnalysis {
  verdict: 'Bom' | 'Neutro' | 'Ruim';
  explanation: string;
  calories?: string;
  macros?: string;
  score: number;
  carbs?: string;
  protein?: string;
  fat?: string;
}
