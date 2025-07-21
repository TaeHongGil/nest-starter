// ----------------------------------------------------------------------

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
}

// ----------------------------------------------------------------------

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key,
): (
  a: {
    [key in Key]: number | string;
  },
  b: {
    [key in Key]: number | string;
  },
) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------
// filterKey를 지정할 수 있도록 확장

type ApplyFilterProps = {
  inputData: any[];
  filterName: string;
  comparator: (a: any, b: any) => number;
  filterKey?: string;
};

export function applyFilter({ inputData, comparator, filterName, filterKey = 'name' }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;

    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter((data) => {
      const value = data[filterKey];

      if (typeof value === 'string') {
        return value.toLowerCase().indexOf(filterName.toLowerCase()) !== -1;
      } else if (typeof value === 'number') {
        return String(value).indexOf(filterName) !== -1;
      } else if (Array.isArray(value)) {
        return value.some((v) => String(v).toLowerCase().indexOf(filterName.toLowerCase()) !== -1);
      }
    });
  }

  return inputData;
}
