import type { SxProps, Theme } from '@mui/material/styles';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';

import type { IPostItem } from './post-item';

// ----------------------------------------------------------------------

type PostSearchProps = {
  posts: IPostItem[];
  sx?: SxProps<Theme>;
};

export function PostSearch({ posts, sx }: PostSearchProps) {
  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            [`& .${autocompleteClasses.option}`]: {
              typography: 'body2',
            },
            ...sx,
          },
        },
      }}
      options={posts}
      getOptionLabel={(post) => post.title}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search post..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, width: 20, height: 20, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
