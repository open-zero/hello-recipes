import { ApiError } from '#src/lib/ApiError.ts';
import type { FastifyTypebox } from '#src/server/fastifyTypebox.ts';
import { prisma, type Prisma } from '@open-zero/database';
import {
  importedRecipeSchema,
  recipeImportSchema,
} from '@open-zero/features/recipe-imports';
import { recipeSchema } from '@open-zero/features/recipes';
import { Type } from '@sinclair/typebox';
import { verifySession } from '../auth/verifySession.ts';
import { recipeInclude } from '../recipes/recipeDtoUtils.ts';
import { getLlmImportRecipe } from './getLlmImportRecipe.ts';
import { isValidHttpUrl } from './isValidHttpUrl.ts';

const routeTag = 'Recipe imports';

// eslint-disable-next-line @typescript-eslint/require-await
export async function recipeImportRoutes(fastify: FastifyTypebox) {
  fastify.post(
    '',
    {
      preHandler: fastify.auth([verifySession]),
      schema: {
        tags: [routeTag],
        summary: 'Import a recipe from a url',
        body: Type.Object({
          url: Type.String({
            format: 'uri',
          }),
        }),
        response: {
          200: Type.Object({
            recipe: importedRecipeSchema,
            websitePageId: Type.String(),
          }),
        },
      },
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (request) => {
      const { url: urlString } = request.body;

      if (!isValidHttpUrl(urlString)) {
        throw new ApiError({
          statusCode: 400,
          message: 'Invalid URL',
          name: 'InvalidUrl',
        });
      }

      const { parsedRecipe: recipe, websitePage } =
        await getLlmImportRecipe(urlString);

      return {
        websitePageId: websitePage.id,
        recipe: recipe,
      };
    },
  );

  fastify.post(
    '/quick',
    {
      preHandler: fastify.auth([verifySession]),
      schema: {
        tags: [routeTag],
        summary: 'Import a recipe from a url (don\t await parsing)',
        body: Type.Object({
          url: Type.String({ format: 'uri' }),
        }),
        response: {
          200: Type.Object({
            recipe: recipeSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const { url } = request.body;

      const userId = request.session?.userId;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!isValidHttpUrl(url)) {
        throw new ApiError({
          statusCode: 400,
          message: 'Invalid URL',
          name: 'InvalidUrl',
        });
      }

      const recipeImport = await prisma.recipeImport.create({
        data: {
          url: url,
          userId: userId,
          status: 'parsing',
        },
      });

      reply.code(202).send();

      const { parsedRecipe, websitePage } = await getLlmImportRecipe(url);

      const {
        cookTime,
        description,
        ingredientGroups,
        instructionGroups,
        name,
        nutrition,
        prepTime,
        servings,
      } = parsedRecipe;

      if (!ingredientGroups || !instructionGroups) {
        throw new ApiError({
          statusCode: 400,
          message: 'Failed to parse recipe with OpenAI response',
          name: 'InvalidRecipe',
        });
      }

      if (!name) {
        throw new ApiError({
          statusCode: 400,
          message: 'Recipe name is required',
          name: 'InvalidRecipe',
        });
      }

      let ingredientTerms = ingredientGroups.flatMap((group) =>
        group.ingredients.map((ingredient) =>
          ingredient.name.toLocaleLowerCase(),
        ),
      );

      ingredientTerms.push(
        ...ingredientTerms.map((term) => term.split(' ')).flat(),
      );

      ingredientTerms = [...new Set(ingredientTerms.filter(Boolean))];

      const conditions: Prisma.CanonicalIngredientWhereInput[] =
        ingredientTerms.flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' } },
          {
            aliases: {
              some: { name: { contains: term, mode: 'insensitive' } },
            },
          },
        ]);

      const canonicalIngredients = await prisma.canonicalIngredient.findMany({
        where: {
          OR: conditions,
        },
        include: {
          aliases: {
            select: {
              name: true,
            },
          },
        },
      });

      await prisma.recipe.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          name: name,
          description: description ?? null,
          prepTime: prepTime,
          cookTime: cookTime,
          servings: servings,
          tryLater: false,
          ingredientGroups: {
            create: ingredientGroups.map((ingredientGroup, index) => ({
              name: ingredientGroup.name,
              order: index,
              ingredients: {
                create: ingredientGroup.ingredients.map((ingredient, index) => {
                  const terms = ingredient.name
                    .toLocaleLowerCase()
                    .split(' ')
                    .filter(Boolean);
                  const matchingCanonicalIngredient =
                    canonicalIngredients.find((canonicalIngredient) =>
                      ingredient.name
                        .toLocaleLowerCase()
                        .includes(canonicalIngredient.name),
                    ) ??
                    canonicalIngredients.find(
                      (canonicalIngredient) =>
                        terms.includes(canonicalIngredient.name) ||
                        canonicalIngredient.aliases.some((alias) =>
                          terms.includes(alias.name),
                        ),
                    );

                  return {
                    ...ingredient,
                    order: index,
                    canonicalIngredientId:
                      canonicalIngredients.find(
                        (canonicalIngredient) =>
                          canonicalIngredient.name ===
                          ingredient.name.toLocaleLowerCase(),
                      )?.id ??
                      matchingCanonicalIngredient?.id ??
                      null,
                  };
                }),
              },
            })),
          },
          instructionGroups: {
            create: instructionGroups.map((instructionGroup, index) => ({
              name: instructionGroup.name,
              order: index,
              instructions: {
                create: instructionGroup.instructions.map(
                  (instruction, index) => ({
                    order: index,
                    text: instruction,
                  }),
                ),
              },
            })),
          },
          sourceWebsitePage: {
            connect: {
              id: websitePage.id,
            },
          },
          nutrition: nutrition
            ? {
                create: nutrition,
              }
            : undefined,
        },
        include: recipeInclude,
      });

      await prisma.recipeImport.update({
        where: {
          id: recipeImport.id,
        },
        data: {
          status: 'complete',
        },
      });
    },
  );

  fastify.get(
    '',
    {
      preHandler: fastify.auth([verifySession]),
      schema: {
        tags: [routeTag],
        summary: 'List recipe imports',
        querystring: Type.Object({
          userId: Type.String({
            format: 'uuid',
          }),
          status: Type.Optional(
            Type.Union([
              Type.Literal('parsing'),
              Type.Literal('complete'),
              Type.Literal('failed'),
            ]),
          ),
        }),
        response: {
          200: Type.Object({
            recipeImports: Type.Array(recipeImportSchema),
          }),
        },
      },
    },
    async (request) => {
      const { userId, status } = request.query;

      if (userId !== request.session?.userId) {
        throw new ApiError({
          statusCode: 403,
          message: 'Forbidden',
          name: 'AuthError',
        });
      }

      const recipeImports = await prisma.recipeImport.findMany({
        where: {
          status: status ?? undefined,
        },
      });

      return {
        recipeImports: recipeImports,
      };
    },
  );
}
