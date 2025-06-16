import { Type, type Static } from '@sinclair/typebox';
import { Nullable } from '../../lib/nullable.js';

const recipeImportSchemaId = 'RecipeImport';

export type RecipeImport = Static<typeof recipeImportSchema>;
export const recipeImportSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
    }),

    createdAt: Type.Unsafe<Date>(Type.String({ format: 'date-time' })),

    userId: Type.String({
      format: 'uuid',
    }),

    url: Type.String({
      format: 'uri',
      description: 'The URL of the recipe to import',
    }),

    error: Nullable(Type.String()),

    status: Type.Union([
      Type.Literal('parsing'),
      Type.Literal('complete'),
      Type.Literal('failed'),
    ]),
  },
  { $id: recipeImportSchemaId },
);

export const recipeImportSchemaRef = Type.Unsafe<RecipeImport>(
  Type.Ref(recipeImportSchemaId),
);
