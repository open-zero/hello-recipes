import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { type MutationConfig } from '../../lib/tanstackQuery.js';

export interface DeleteRecipeDTO {
  recipeId: string;
}

function deleteRecipe({ recipeId }: DeleteRecipeDTO) {
  return api.delete(`recipes/${recipeId}`).then(() => null);
}

interface Options {
  mutationConfig?: MutationConfig<typeof deleteRecipe>;
}

export function useDeleteRecipe({ mutationConfig }: Options = {}) {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['recipes'],
      });

      void onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteRecipe,
  });
}
