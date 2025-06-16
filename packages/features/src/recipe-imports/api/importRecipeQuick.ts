import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import type { MutationConfig } from '../../lib/tanstackQuery.js';

function importRecipeQuick(url: string) {
  return api.post(`recipe-imports/quick`, {
    json: {
      url,
    },
    timeout: 60000,
  });
}

interface Options {
  mutationConfig?: MutationConfig<typeof importRecipeQuick>;
}

export function useImportRecipeQuick({ mutationConfig }: Options = {}) {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: ['recipeImports'],
      });

      void onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: importRecipeQuick,
  });
}
