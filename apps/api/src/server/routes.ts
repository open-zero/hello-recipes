import { authRoutes } from '#src/features/auth/authRoutes.ts';
import { canonicalIngredientRoutes } from '#src/features/canonical-ingredients/canonicalIngredientRoutes.ts';
import { recipeBookRequestRoutes } from '#src/features/recipe-book-requests/recipeBookRequestRoutes.ts';
import { imageRoutes } from '../features/images/imageRoutes.ts';
import { recipeBookRoutes } from '../features/recipe-books/recipeBookRoutes.ts';
import { recipeImportRoutes } from '../features/recipe-imports/recipeImportRoutes.ts';
import { recipeRoutes } from '../features/recipes/recipeRoutes.ts';
import { userRoutes } from '../features/users/userRoutes.ts';
import type { FastifyTypebox } from './fastifyTypebox.ts';

export async function routes(fastify: FastifyTypebox) {
  await fastify.register(canonicalIngredientRoutes, {
    prefix: '/canonical-ingredients',
  });
  await fastify.register(recipeRoutes, { prefix: '/recipes' });
  await fastify.register(recipeBookRoutes, { prefix: '/recipe-books' });
  await fastify.register(recipeImportRoutes, { prefix: '/recipe-imports' });
  await fastify.register(recipeBookRequestRoutes, {
    prefix: '/recipe-book-requests',
  });
  await fastify.register(imageRoutes, { prefix: '/images' });
  await fastify.register(userRoutes, { prefix: '/users' });
  await fastify.register(authRoutes);

  fastify.get(
    '/openapi-spec',
    {
      schema: {
        tags: ['Developer'],
        summary: 'Get OpenAPI spec (json)',
      },
    },
    () => {
      return fastify.swagger();
    },
  );
}
