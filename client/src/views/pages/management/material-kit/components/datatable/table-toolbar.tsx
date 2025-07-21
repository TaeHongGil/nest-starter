import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { HeadLabel } from '@root/views/pages/management/material-kit/components/datatable/components';

// import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';

// ----------------------------------------------------------------------

type TableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterKey: string;
  onFilterKey: (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>) => void;
  headLabel: HeadLabel[];
};

export function TableToolbar({ numSelected, filterName, onFilterName, filterKey, onFilterKey, headLabel }: TableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <OutlinedInput
            fullWidth
            value={filterName}
            onChange={onFilterName}
            placeholder="Search..."
            startAdornment={<InputAdornment position="start">{/* <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} /> */}</InputAdornment>}
            sx={{ maxWidth: 320 }}
          />
          <Select value={filterKey} onChange={onFilterKey} size="small" sx={{ minWidth: 200, background: 'white' }}>
            {headLabel.map((header) => (
              <MenuItem key={header.id} value={header.id}>
                {header.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>{/* <Iconify icon="solar:trash-bin-trash-bold" /> */}</IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>{/* <Iconify icon="ic:round-filter-list" /> */}</IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
