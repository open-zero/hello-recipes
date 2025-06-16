import { Card, CircularProgress, Typography } from '@mui/material';
import type { RecipeImport } from '@open-zero/features/recipe-imports';

interface Props {
  recipeImport: RecipeImport;
}

export function RecipeImportCard({ recipeImport }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          textOverflow: 'ellipsis',
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        Importing: {recipeImport.url}
      </Typography>
      <CircularProgress sx={{ flexShrink: 0, ml: 2 }} size={16} />
    </Card>
  );
}
