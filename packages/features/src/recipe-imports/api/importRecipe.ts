import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import type { MutationConfig } from '../../lib/tanstackQuery.js';
import type { ImportedRecipe } from '../types/importedRecipe.js';

function importRecipe(url: string) {
  return api
    .post(`recipe-imports`, {
      json: {
        url: url,
      },
      timeout: 60000,
    })
    .json<{ recipe: ImportedRecipe; websitePageId: string }>();
}

interface Options {
  mutationConfig?: MutationConfig<typeof importRecipe>;
}

export function useImportRecipe({ mutationConfig }: Options = {}) {
  return useMutation({
    ...mutationConfig,
    mutationFn: importRecipe,
  });
}
