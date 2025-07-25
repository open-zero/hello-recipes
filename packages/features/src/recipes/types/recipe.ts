import { Type, type Static } from '@sinclair/typebox';
import type { Decimal } from 'decimal.js';
import { tagSchema } from '../../common/tag.js';
import { Nullable } from '../../lib/nullable.js';
import { nutritionSchemaRef } from './nutrition.js';

const recipeSchemaId = 'Recipe';

export type Recipe = Static<typeof recipeSchema>;
export const recipeSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
      description: 'unique id',
    }),

    userId: Type.String({
      format: 'uuid',
      description: 'id of the user who created the recipe',
    }),

    createdAt: Type.Unsafe<Date>(Type.String({ format: 'date-time' })),

    name: Type.String(),

    description: Nullable(Type.String()),

    prepTime: Nullable(Type.Number()),
    cookTime: Nullable(Type.Number()),

    servings: Nullable(Type.Number()),

    tryLater: Type.Boolean(),

    favorite: Type.Boolean(),

    websiteSource: Nullable(
      Type.Object({
        title: Nullable(Type.String()),
        url: Type.String(),
      }),
    ),

    images: Nullable(
      Type.Array(
        Type.Object({
          id: Type.String(),
          url: Type.String(),
          favorite: Type.Boolean(),
        }),
      ),
    ),

    ingredientGroups: Type.Array(
      Type.Object({
        id: Type.String(),
        name: Nullable(Type.String()),
        ingredients: Type.Array(
          Type.Object({
            id: Type.String(),
            name: Type.String(),
            quantity: Nullable(Type.Unsafe<Decimal>(Type.Number())),
            unit: Nullable(Type.String()),
            notes: Nullable(Type.String()),
            icon_url: Nullable(Type.String()),
          }),
        ),
      }),
    ),

    instructionGroups: Type.Array(
      Type.Object({
        id: Type.String(),
        name: Nullable(Type.String()),
        instructions: Type.Array(
          Type.Object({
            id: Type.String(),
            text: Type.String(),
          }),
        ),
      }),
    ),

    tags: Type.Array(tagSchema),

    nutrition: Type.Optional(nutritionSchemaRef),

    usesRecipes: Type.Optional(Type.Array(Type.String())),
  },
  { $id: recipeSchemaId },
);

export const recipeSchemaRef = Type.Unsafe<Recipe>(Type.Ref(recipeSchemaId));
