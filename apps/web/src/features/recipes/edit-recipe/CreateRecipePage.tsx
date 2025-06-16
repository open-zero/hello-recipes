import { useSignedInUserId } from '#src/features/auth/useSignedInUserId';
import { useAppForm } from '#src/hooks/form';
import { focusNextInput } from '#src/utils/focusNextInput';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { emptyStringToNull, emptyStringToUndefined } from '@open-zero/features';
import {
  useCreateRecipe,
  useRecipes,
  useUpdateRecipe,
} from '@open-zero/features/recipes';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { RequiredRecipeCard } from '../RequiredRecipeCard';
import { EditIngredientGroup } from './EditIngredientGroup';
import { EditInstructionGroup } from './EditInstructionGroup';
import { EditNutrition } from './EditNutrition';
import { ImportRecipeDialog } from './ImportRecipeDialog';
import {
  recipeFormOptions,
  recipeFormSchema,
  type RecipeFormInputs,
} from './recipeForm';
import { UploadRecipeImage } from './UploadRecipeImage';

interface Props {
  defaultValues?: RecipeFormInputs;
  updateRecipeId?: string;
}

export function CreateRecipePage({ defaultValues, updateRecipeId }: Props) {
  const { importFromUrl } = useSearch({ strict: false });
  const [importDialogOpen, setImportDialogOpen] = useState(
    importFromUrl ?? false,
  );
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const form = useAppForm({
    ...recipeFormOptions,
    defaultValues:
      defaultValues ??
      ({
        recipeName: '',
        description: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        image: null,
        tryLater: false,
        ingredientGroups: [
          {
            id: null,
            name: null,
            ingredients: [
              {
                name: '',
                unit: null,
                quantity: null,
                notes: null,
              },
              {
                name: '',
                unit: null,
                quantity: null,
                notes: null,
              },
              {
                name: '',
                unit: null,
                quantity: null,
                notes: null,
              },
            ],
          },
        ],
        usesRecipes: [],
        instructionGroups: [
          {
            id: null,
            name: null,
            instructions: [
              {
                text: '',
              },
              {
                text: '',
              },
              {
                text: '',
              },
            ],
          },
        ],
      } as RecipeFormInputs),
    onSubmit: ({ value }) => {
      const parsed = recipeFormSchema.parse(value);

      if (updateRecipeId) {
        updateRecipe.mutate({
          id: updateRecipeId,
          name: parsed.recipeName,
          description: emptyStringToNull(parsed.description),
          prepTime: parsed.prepTime,
          cookTime: parsed.cookTime,
          servings: parsed.servings ? parseInt(parsed.servings) : null,
          tryLater: parsed.tryLater,
          ingredientGroups: parsed.ingredientGroups,
          instructionGroups: parsed.instructionGroups.map((ig) => ({
            id: ig.id ?? undefined,
            name: ig.name,
            instructions: ig.instructions,
          })),
          imageIds: parsed.image ? [parsed.image.id] : null,
          nutrition: parsed.nutrition,
        });
      } else {
        createRecipe.mutate({
          name: parsed.recipeName,
          description: emptyStringToUndefined(parsed.description),
          websitePageId: parsed.websitePageId,
          prepTime: parsed.prepTime,
          cookTime: parsed.cookTime,
          servings: parsed.servings ? parseInt(parsed.servings) : undefined,
          imageIds: parsed.image ? [parsed.image.id] : undefined,
          tryLater: parsed.tryLater,
          ingredientGroups: parsed.ingredientGroups,
          instructionGroups: parsed.instructionGroups,
          nutrition: parsed.nutrition,
        });
      }
    },
  });
  const userId = useSignedInUserId();

  const { data: recipes } = useRecipes({
    options: {
      userId: userId,
    },
  });

  const createRecipe = useCreateRecipe({
    mutationConfig: {
      onSuccess: (newRecipe) => {
        void navigate({
          to: `/app/recipes/$recipeId`,
          params: {
            recipeId: newRecipe.id,
          },
        });
      },
    },
  });

  const updateRecipe = useUpdateRecipe({
    mutationConfig: {
      onSuccess: (data) => {
        enqueueSnackbar('Recipe updated', { variant: 'success' });

        void navigate({
          to: `/app/recipes/$recipeId`,
          params: {
            recipeId: data.recipe.id,
          },
        });
      },
    },
  });

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        pb: 4,
        width: '100%',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 8,
            maxWidth: 750,
            backgroundColor: (theme) => theme.vars.palette.background.paper,
            zIndex: 11,
            px: 2,
            py: 1.5,
            borderRadius: 1.5,
            boxShadow:
              '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <Typography variant="h1">
            {updateRecipeId ? 'Edit recipe' : 'New recipe'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            type="submit"
            loading={createRecipe.isPending || updateRecipe.isPending}
            sx={{
              display: 'flex',
            }}
          >
            Save
          </Button>
        </Box>
        <Button
          size="small"
          startIcon={<LinkRoundedIcon />}
          onClick={() => {
            setImportDialogOpen(true);
          }}
          sx={{
            mb: 2,
            mt: 2,
          }}
        >
          Import from url
        </Button>
        <Grid
          container
          spacing={3}
          sx={{
            mb: 2,
            maxWidth: '750px',
          }}
        >
          <Grid size={{ xs: 12 }}>
            <form.AppField
              name="recipeName"
              children={(field) => (
                <field.TextField
                  label="Recipe name"
                  fullWidth
                  multiline
                  required
                  onKeyDown={(event) => {
                    focusNextInput(event, 'textarea[name="description"]');
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <form.AppField
              name="description"
              children={(field) => (
                <field.TextField label="Description" fullWidth multiline />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <form.AppField
              name="servings"
              children={(field) => (
                <field.TextField
                  label="Servings"
                  type="number"
                  fullWidth
                  size="small"
                  onKeyDown={(event) => {
                    focusNextInput(event, 'input[name="prepTime"]');
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <form.AppField
              name="prepTime"
              children={(field) => (
                <field.TextField
                  label="Prep time"
                  type="number"
                  fullWidth
                  size="small"
                  onKeyDown={(event) => {
                    focusNextInput(event, 'input[name="cookTime"]');
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">minutes</InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <form.AppField
              name="cookTime"
              children={(field) => (
                <field.TextField
                  label="Cook time"
                  type="number"
                  fullWidth
                  size="small"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                    }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">minutes</InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
        <form.Field
          name="tryLater"
          children={({ state, handleChange, handleBlur }) => {
            return (
              <FormGroup
                sx={{
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      onChange={(e) => {
                        handleChange(e.target.checked);
                      }}
                      onBlur={handleBlur}
                      checked={state.value}
                    />
                  }
                  label="Try later"
                />
              </FormGroup>
            );
          }}
        />
        <UploadRecipeImage form={form} sx={{ mb: 6 }} />
        <Typography variant="h2" sx={{ mb: 2 }}>
          Ingredients
        </Typography>
        <form.Field name="ingredientGroups" mode="array">
          {(field) => {
            return (
              <>
                <Stack
                  direction={'column'}
                  spacing={2}
                  sx={{ mb: 2, maxWidth: '750px' }}
                >
                  {field.state.value.map((_, ingredientGroupIndex) => {
                    return (
                      <EditIngredientGroup
                        form={form}
                        key={ingredientGroupIndex}
                        index={ingredientGroupIndex}
                      />
                    );
                  })}
                </Stack>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    field.pushValue({
                      id: null,
                      name: null,
                      ingredients: [
                        {
                          name: '',
                          unit: null,
                          quantity: null,
                          notes: null,
                        },
                      ],
                    });
                  }}
                  sx={{ mb: 6 }}
                >
                  Add ingredient group
                </Button>
              </>
            );
          }}
        </form.Field>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Instructions
        </Typography>
        <form.Field name="instructionGroups" mode="array">
          {(field) => {
            return (
              <>
                <Stack
                  direction={'column'}
                  spacing={2}
                  sx={{ mb: 2, maxWidth: '750px' }}
                >
                  {field.state.value.map((_, instructionGroupIndex) => {
                    return (
                      <EditInstructionGroup
                        form={form}
                        key={instructionGroupIndex}
                        index={instructionGroupIndex}
                      />
                    );
                  })}
                </Stack>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    field.pushValue({
                      id: null,
                      name: null,
                      instructions: [
                        {
                          text: '',
                        },
                      ],
                    });
                  }}
                  sx={{ mb: 6 }}
                >
                  Add instruction group
                </Button>
              </>
            );
          }}
        </form.Field>
        <EditNutrition form={form} sx={{ mb: 6, maxWidth: 750 }} />
        <Typography variant="h2" sx={{ mb: 2 }}>
          Required recipes
        </Typography>
        <form.Field name="usesRecipes" mode="array">
          {(field) => {
            return (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {field.state.value.map((usesRecipe, index) => {
                    return (
                      <Grid
                        key={usesRecipe.recipeId}
                        size={{
                          xs: 12,
                          md: 4,
                          lg: 3,
                        }}
                      >
                        <RequiredRecipeCard
                          recipeId={usesRecipe.recipeId}
                          onRemove={() => {
                            field.removeValue(index);
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
                <Autocomplete
                  options={
                    recipes?.map((r) => {
                      return { label: r.name, id: r.id };
                    }) ?? []
                  }
                  size="small"
                  renderInput={(params) => (
                    <TextField {...params} label="Add required recipe" />
                  )}
                  onChange={(_, value) => {
                    if (value) {
                      field.pushValue({ recipeId: value.id });
                    }
                  }}
                  sx={{
                    mb: 6,
                    maxWidth: 300,
                  }}
                />
              </>
            );
          }}
        </form.Field>
      </form>
      <ImportRecipeDialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);

          void navigate({
            to: '.',
            search: (prev) => ({
              ...prev,
              importFromUrl: undefined,
            }),
          });
        }}
        onImport={(importedRecipe, websitePageId) => {
          setImportDialogOpen(false);

          void navigate({
            to: '.',
            search: (prev) => ({
              ...prev,
              importFromUrl: undefined,
            }),
          });

          form.setFieldValue('recipeName', importedRecipe.name);
          form.setFieldValue('description', importedRecipe.description);
          form.setFieldValue(
            'cookTime',
            importedRecipe.cookTime?.toString() ?? '',
          );
          form.setFieldValue(
            'prepTime',
            importedRecipe.prepTime?.toString() ?? '',
          );
          form.setFieldValue(
            'servings',
            importedRecipe.servings?.toString() ?? '',
          );
          form.setFieldValue('websitePageId', websitePageId);
          form.setFieldValue(
            'ingredientGroups',
            importedRecipe.ingredientGroups?.map((ig) => ({
              name: ig.name,
              ingredients: ig.ingredients.map((ingredient) => ({
                name: ingredient.name,
                unit: ingredient.unit ?? null,
                quantity: ingredient.quantity ?? null,
                notes: ingredient.notes ?? null,
              })),
            })) ?? [],
          );
          form.setFieldValue(
            'instructionGroups',
            importedRecipe.instructionGroups?.map((ig) => ({
              name: ig.name,
              instructions: ig.instructions.map((i) => ({ text: i })),
            })) ?? [],
          );
          form.setFieldValue('usesRecipes', []);
          form.setFieldValue(
            'nutrition',
            importedRecipe.nutrition ?? undefined,
          );
          form.setFieldValue('image', null);
        }}
      />
    </Box>
  );
}
