import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod/v4';
import { makeRequest } from '../../lib/request.js';
import { defineContract } from '../../lib/routeContracts.js';
import type { QueryConfig } from '../../lib/tanstackQuery.js';
import { recipeBookSchema } from '../types/recipeBook.js';

export const listRecipeBooksContract = defineContract('recipe-books', {
  method: 'get',
  querystring: z.object({
    userId: z.uuidv4(),
  }),
  response: {
    200: z.object({
      recipeBooks: recipeBookSchema.array(),
    }),
  },
});

const listRecipeBooks = makeRequest(listRecipeBooksContract, {
  select: (res) => res.recipeBooks,
});

export function listRecipeBooksQueryOptions(options: { userId: string }) {
  return queryOptions({
    queryKey: ['recipeBooks', options],
    queryFn: () => listRecipeBooks({ querystring: options }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

interface Options {
  queryConfig?: QueryConfig<typeof listRecipeBooksQueryOptions>;
  options: {
    userId: string;
  };
}

export function useRecipeBooks({ queryConfig, options }: Options) {
  return useQuery({
    ...listRecipeBooksQueryOptions(options),
    ...queryConfig,
  });
}
