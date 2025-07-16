import { useCallback, useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';

// ----------------------------------------------------------------------

export type PopoverListItem = {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onClick: (row: any, close: () => void) => void;
};

type TableRowProps = {
  row: any;
  selected: boolean;
  onSelectRow: () => void;
  cellRenderers?: (((row: any, key: string) => React.ReactNode) | undefined)[];
  headLabel: { id: string; label: string; align?: string }[];
  showCheckbox?: boolean;
  popoverList?: PopoverListItem[];
};

export function DataTableRow({ row, selected, onSelectRow, cellRenderers, headLabel, showCheckbox = false, popoverList }: TableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Popover 메뉴가 없으면 버튼/Popover 자체를 숨김
  const hasPopover = popoverList && popoverList.length > 0;

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {showCheckbox && (
          <TableCell padding="checkbox">
            <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
          </TableCell>
        )}
        {headLabel.map((header, idx) => {
          if (header.id === '__actions__') {
            return hasPopover ? (
              <TableCell key={header.id} align={header.align as any}>
                <IconButton onClick={handleOpenPopover}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            ) : null;
          }

          return (
            <TableCell key={header.id} align={header.align as any}>
              {cellRenderers && cellRenderers[idx] ? cellRenderers[idx](row, header.id) : row[header.id]}
            </TableCell>
          );
        })}
      </TableRow>

      {hasPopover && (
        <Popover
          open={!!openPopover}
          anchorEl={openPopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList
            disablePadding
            sx={{
              p: 0.5,
              gap: 0.5,
              width: 140,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
              },
            }}
          >
            {popoverList!.map((item, idx) => (
              <MenuItem
                key={item.label + idx}
                onClick={() => {
                  item.onClick(row, handleClosePopover);
                }}
                sx={item.color ? { color: item.color } : {}}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      )}
    </>
  );
}
