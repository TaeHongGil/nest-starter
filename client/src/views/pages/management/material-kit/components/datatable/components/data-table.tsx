import { useCallback, useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Scrollbar } from '@root/views/pages/management/material-kit/components/scrollbar';

import { TableEmptyRows } from '../table-empty-rows';
import { DataTableHead } from '../table-head';
import { TableNoData } from '../table-no-data';
import { DataTableRow, PopoverListItem } from '../table-row';
import { TableToolbar } from '../table-toolbar';
import { applyFilter, emptyRows, getComparator } from '../utils';

// ----------------------------------------------------------------------

export interface HeadLabel {
  id: string;
  label: string;
  align?: string;
}

import { SxProps } from '@mui/material';

export interface DataTableProps {
  inputData: any[];
  headLabel: HeadLabel[];
  cellRenderers?: (((row: any, key: string) => React.ReactNode) | undefined)[];
  onSelectRow?: (rows: any[]) => void;
  showCheckbox?: boolean;
  showToolbar?: boolean;
  popoverList?: PopoverListItem[];
  sx?: SxProps;
}

export function DataTable(props: DataTableProps) {
  const { inputData, headLabel, cellRenderers, onSelectRow, showCheckbox = false, popoverList, showToolbar = true, sx } = props;
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [filterKey, setFilterKey] = useState(headLabel[0]?.id || 'name');
  const normalizedData = inputData.map((row, idx) => (row.id === undefined ? { ...row, id: idx } : row));
  const dataFiltered: any[] = applyFilter({
    inputData: normalizedData,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterKey,
  });
  const notFound = !dataFiltered.length && !!filterName;

  const computedHeadLabel = popoverList && popoverList.length > 0 ? [...headLabel, { id: '__actions__', label: '' }] : headLabel;

  useEffect(() => {
    if (onSelectRow) {
      const selectedRows = normalizedData.filter((r) => table.selected.includes(r.id));
      onSelectRow(selectedRows);
    }
  }, [table.selected]);

  return (
    <Card sx={sx}>
      {showToolbar && (
        <TableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          filterKey={filterKey}
          onFilterKey={(event) => {
            setFilterKey(event.target.value);
            table.onResetPage();
          }}
          headLabel={computedHeadLabel}
        />
      )}
      <Scrollbar>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Table sx={{ minWidth: 800 }}>
            <DataTableHead
              order={table.order}
              orderBy={table.orderBy}
              rowCount={inputData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  inputData.map((user) => user.id),
                );
              }}
              headLabel={computedHeadLabel}
              showCheckbox={showCheckbox}
            />
            <TableBody>
              {dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage).map((row) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  selected={table.selected.includes(row.id)}
                  onSelectRow={() => {
                    table.onSelectRow(row.id);
                  }}
                  cellRenderers={cellRenderers}
                  headLabel={computedHeadLabel}
                  showCheckbox={showCheckbox}
                  popoverList={popoverList}
                />
              ))}
              <TableEmptyRows height={72} emptyRows={emptyRows(table.page, table.rowsPerPage, inputData.length)} />
              {notFound && <TableNoData searchQuery={filterName} />}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <TablePagination
        component="div"
        page={table.page}
        count={inputData.length}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy],
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);

      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue) ? selected.filter((value) => value !== inputValue) : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected],
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage],
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
