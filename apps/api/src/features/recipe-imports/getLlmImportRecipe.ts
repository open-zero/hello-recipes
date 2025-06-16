import {
  browser,
  browserContext,
  initializeBrowser,
} from '#src/lib/browser.ts';
import { openAi } from '#src/lib/openAi.ts';
import { prisma } from '@open-zero/database';
import { zodTextFormat } from 'openai/helpers/zod';
import { type BrowserContext, type Page } from 'playwright-chromium';
import TurndownService from 'turndown';
import { z } from 'zod/v3';

const turndownService = new TurndownService();
turndownService.remove('script');
turndownService.remove('style');

async function processWebsite(data: {
  urlString: string;
  browserContext: BrowserContext;
}) {
  const { urlString, browserContext } = data;

  const url = new URL(urlString);

  const urlHost = url.host;

  const existingWebsite = await prisma.website.findUnique({
    where: {
      host: urlHost,
    },
  });

  if (existingWebsite) {
    return existingWebsite;
  }

  const urlOrigin = url.origin;

  const websitePage = await browserContext.newPage();

  try {
    await websitePage.goto(urlOrigin, {
      waitUntil: 'domcontentloaded',
    });

    const title = await websitePage.title().catch(() => null);
    const openGraphSiteName = await websitePage
      .locator('meta[property="og:site_name"]')
      .getAttribute('content')
      .catch(() => null);
    const openGraphTitle = await websitePage
      .locator('meta[property="og:title"]')
      .getAttribute('content')
      .catch(() => null);
    const description = await websitePage
      .locator('meta[name="description"]')
      .getAttribute('content')
      .catch(() => null);

    await websitePage.close();

    return await prisma.website.create({
      data: {
        host: urlHost,
        title: openGraphSiteName ?? openGraphTitle ?? title,
        description: description,
      },
    });
  } catch (error) {
    await websitePage.close();

    throw error;
  }
}

async function getRecipeHtml(page: Page) {
  const tastyRecipesLocator = page.locator('.tasty-recipes');
  const isTastyRecipes = await tastyRecipesLocator.isVisible();

  if (isTastyRecipes) {
    return await tastyRecipesLocator.innerHTML();
  }

  const wprmLocator = page.locator('.wprm-recipe-container').first();
  const isWprm = await wprmLocator.isVisible();

  if (isWprm) {
    return await wprmLocator.innerHTML();
  }

  const wpDeliciousLocator = page.locator('.dr-summary-holder').first();
  const isWpDelicious = await wpDeliciousLocator.isVisible();

  if (isWpDelicious) {
    return await wpDeliciousLocator.innerHTML();
  }

  // By default we send the whole page
  return page.innerHTML('body');
}

async function getRecipeMarkdown(page: Page) {
  const recipeHtml = await getRecipeHtml(page);

  const recipeMarkdown = turndownService.turndown(recipeHtml);

  return recipeMarkdown;
}

export async function getLlmImportRecipe(urlString: string) {
  if (!browser || !browserContext) {
    await initializeBrowser();

    if (!browser || !browserContext) {
      throw new Error('Failed to initialize browser');
    }
  }

  const website = await processWebsite({ urlString, browserContext });

  const url = new URL(urlString);

  const websitePage = await prisma.websitePage.upsert({
    where: {
      path_websiteId: {
        path: url.pathname,
        websiteId: website.id,
      },
    },
    update: {},
    create: {
      path: url.pathname,
      website: {
        connect: {
          id: website.id,
        },
      },
    },
  });

  const recipePage = await browserContext.newPage();
  await recipePage.goto(urlString);

  const recipeMarkdown = await getRecipeMarkdown(recipePage)
    .then(async (res) => {
      await recipePage.close();

      return res;
    })
    .catch(async (error: unknown) => {
      await recipePage.close();

      throw error;
    });

  const openAiRes = await openAi.responses.parse({
    instructions:
      "Parse the given recipe into a structured recipe object. If you don't find nutrition info, make your best guess.",
    input: recipeMarkdown,
    model: 'gpt-4.1-2025-04-14',
    text: {
      format: zodTextFormat(zodLlmRecipeSchema, 'recipe'),
    },
  });

  const llmRecipe = openAiRes.output_parsed;

  if (!llmRecipe) {
    throw new Error('Failed to parse recipe with OpenAI response');
  }

  llmRecipe.ingredientGroups?.map((ig) =>
    ig.ingredients.map((i) => {
      if (i.unit === '' || i.unit === 'null') {
        i.unit = null;
      } else if (typeof i.unit === 'string') {
        i.unit = i.unit.toLowerCase();
      }

      if (i.notes === '' || i.notes === 'null') {
        i.notes = null;
      }
    }),
  );

  return { parsedRecipe: llmRecipe, websitePage };
}

const zodLlmRecipeSchema = z
  .object({
    name: z.string(),
    description: z
      .string()
      .nullable()
      .describe('Short, friendly description of the recipe'),
    prepTime: z.number().nullable().describe('Prep time in minutes'),
    cookTime: z.number().nullable().describe('Cook time in minutes'),
    totalTime: z.number().nullable().describe('Total time in minutes'),
    servings: z.number().nullable(),
    ingredientGroups: z
      .array(
        z
          .object({
            name: z.string(),
            ingredients: z.array(
              z
                .object({
                  name: z.string(),
                  unit: z.string().nullable(),
                  quantity: z.number().nullable(),
                  notes: z
                    .string()
                    .nullable()
                    .describe(
                      'Optional notes about the ingredient. Don\'t prefix with "Note: " or similar.',
                    ),
                })
                .strict(),
            ),
          })
          .strict(),
      )
      .nullable(),
    instructionGroups: z
      .array(
        z
          .object({
            name: z.string(),
            instructions: z.array(z.string()),
          })
          .strict(),
      )
      .nullable(),
    nutrition: z
      .object({
        calories: z.number().nullable(),
        totalFatG: z.number().nullable(),
        unsaturatedFatG: z.number().nullable(),
        saturatedFatG: z.number().nullable(),
        transFatG: z.number().nullable(),
        carbsG: z.number().nullable(),
        proteinG: z.number().nullable(),
        fiberG: z.number().nullable(),
        sugarG: z.number().nullable(),
        sodiumMg: z.number().nullable(),
        ironMg: z.number().nullable(),
        calciumMg: z.number().nullable(),
        potassiumMg: z.number().nullable(),
        cholesterolMg: z.number().nullable(),
      })
      .strict()
      .nullable(),
  })
  .strict();
