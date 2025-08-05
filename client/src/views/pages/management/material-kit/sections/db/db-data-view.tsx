import { useState } from 'react';
import { TextField, Button, Select, MenuItem, Box, Typography } from '@mui/material';
import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import ServerApi from '@root/common/util/server.api';
import { MongoCollectionSchema } from 'modules/nestjs-api-axios/dist';
import { useEffect } from 'react';

export function DBDataView({ collection }: { collection: MongoCollectionSchema }) {
  const [filter, setFilter] = useState('');
  const [filterError, setFilterError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortKey, setSortKey] = useState('');

  useEffect(() => {
    if (properties.length > 0 && typeof properties[0].name === 'string') {
      setSortKey(properties[0].name);
    } else {
      setSortKey('');
    }
  }, [collection]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const properties = collection.properties ?? [];

  const handleSortKeyChange = (key: string) => {
    setSortKey(key);
  };
  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
  };

  useEffect(() => {
    if (sortKey) {
      setSort(JSON.stringify({ [sortKey]: sortOrder === 'asc' ? 1 : -1 }));
    } else {
      setSort('');
    }
  }, [sortKey, sortOrder]);

  const handleFetch = async () => {
    try {
      let filterStr = '';
      if (filter.trim()) {
        try {
          JSON.parse(filter);
          filterStr = filter;
          setFilterError('');
        } catch (err) {
          setFilterError('JSON 형식이 올바르지 않습니다');

          return;
        }
      }
      const response = await ServerApi.Admin.adminControllerGetDBDataWithFilter(collection.name, page, filterStr, sort);
      setResult(response.data.data?.data ?? []);
      setTotal(response.data.data?.total ?? 0);
    } catch (e) {
      alert('조회 실패');
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', m: 2 }}>
        <Select size="small" value={sortKey || ''} onChange={(e) => handleSortKeyChange(e.target.value)} displayEmpty disabled={!collection}>
          {properties
            .filter((p: any) => p.name !== '_id')
            .map((p: any) => (
              <MenuItem key={p.name} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
        </Select>
        <Select size="small" value={sortOrder} onChange={(e) => handleSortOrderChange(e.target.value)} disabled={!sortKey}>
          <MenuItem value="asc">오름차순</MenuItem>
          <MenuItem value="desc">내림차순</MenuItem>
        </Select>
        <TextField size="small" label="페이지 번호 (size: 100)" type="number" value={page} onChange={(e) => setPage(Number(e.target.value))} sx={{ width: 200 }} />
        <Button variant="contained" onClick={handleFetch}>
          조회
        </Button>
        <Button variant="contained" color="info" onClick={() => setFilterOpen((prev) => !prev)}>
          {filterOpen ? '필터 닫기' : '필터 열기'}
        </Button>
        <Typography>총: {total}</Typography>
      </Box>
      {filterOpen && (
        <TextField
          label="필터(MongoDB Find)"
          spellCheck={false}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          multiline
          minRows={5}
          fullWidth
          error={filterError !== ''}
          helperText={filterError}
        />
      )}
      <DataTable
        sx={{ minHeight: '70vh', maxHeight: '70vh', overflow: 'auto' }}
        inputData={result}
        headLabel={Object.keys(result[0] ?? {}).map((key) => ({ id: key, label: key }))}
        cellRenderers={Object.keys(result[0] ?? {}).map((key) => {
          const CellRenderer = (row: any) => (row[key] ? <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(row[key], null, 2)}</pre> : '-');
          CellRenderer.displayName = `CellRenderer_${key}`;

          return CellRenderer;
        })}
      />
    </Box>
  );
}
