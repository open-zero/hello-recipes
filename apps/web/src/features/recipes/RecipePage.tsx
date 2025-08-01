import { Page } from '#src/components/Page';
import { useRecipe } from '@repo/features/recipes';
import { getRouteApi } from '@tanstack/react-router';
import { useSignedInUserId } from '../auth/useSignedInUserId';
import { Recipe } from './Recipe';

const route = getRouteApi('/app/_auth/recipes/$recipeId');

export function RecipePage() {
  const { recipeId } = route.useParams();
  const { data: recipe } = useRecipe({ recipeId });
  const userId = useSignedInUserId();

  const ownsRecipe = recipe?.userId === userId;

  return (
    <Page maxWidth="md">
      <Recipe recipeId={recipeId} readOnly={!ownsRecipe} />
    </Page>
  );
}
