import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import type { QueryConfig } from '../../lib/tanstackQuery.js';
import type { RecipeImport } from '../types/recipeImport.js';

function listRecipeImports(options: {
  userId: string;
}): Promise<RecipeImport[]> {
  return api
    .get(`recipe-imports`, {
      searchParams: {
        userId: options.userId,
        status: 'parsing',
      },
    })
    .json<{ recipeImports: RecipeImport[] }>()
    .then((res) => res.recipeImports);
}

export function listRecipeImportsQueryOptions(options: { userId: string }) {
  return queryOptions({
    queryKey: ['recipeImports', options],
    queryFn: () => listRecipeImports(options),
  });
}

interface Options {
  queryConfig?: QueryConfig<typeof listRecipeImportsQueryOptions>;
  options: {
    userId: string;
  };
}

export function useRecipeImports({ queryConfig, options }: Options) {
  return useQuery({
    ...listRecipeImportsQueryOptions(options),
    ...queryConfig,
  });
}
