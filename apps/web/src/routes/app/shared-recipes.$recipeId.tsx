import { SharedRecipePage } from '#src/features/recipes/SharedRecipePage';
import { getRecipeQueryOptions } from '@open-zero/features/recipes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/shared-recipes/$recipeId')({
  loader: ({ context: { queryClient }, params: { recipeId } }) => {
    return queryClient.ensureQueryData(getRecipeQueryOptions(recipeId));
  },
  component: SharedRecipePage,
  head: ({ loaderData }) => {
    return {
      meta: [
        {
          title: loaderData?.name ?? 'Shared recipe',
        },
        {
          property: 'og:title',
          content: loaderData?.name ?? 'Shared recipe',
        },
      ],
    };
  },
});
