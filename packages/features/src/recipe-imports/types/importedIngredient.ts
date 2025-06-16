import { Type, type Static } from '@sinclair/typebox';
import { Nullable } from '../../lib/nullable.js';

const importedIngredientSchemaId = 'ImportedIngredient';

export type ImportedIngredient = Static<typeof importedIngredientSchema>;
export const importedIngredientSchema = Type.Object(
  {
    name: Type.String(),
    unit: Nullable(Type.String()),
    quantity: Nullable(Type.Number()),
    notes: Nullable(Type.String()),
  },
  { $id: importedIngredientSchemaId },
);

export const importedIngredientSchemaRef = Type.Unsafe<ImportedIngredient>(
  Type.Ref(importedIngredientSchemaId),
);
