import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';

import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import ServerApi from '@root/common/util/server.api';
import { useEffect, useState } from 'react';
import { MongoCollectionSchema } from 'modules/nestjs-api-axios/dist';
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { DBDataView } from '@root/views/pages/management/material-kit/sections/db/db-data-view';
import { Close } from '@mui/icons-material';

// ----------------------------------------------------------------------

export function DBView() {
  const [data, setData] = useState<MongoCollectionSchema[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MongoCollectionSchema | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const fetchCollections = async () => {
    const response = await ServerApi.Admin.adminControllerGetDBList();
    setData(response.data.data?.result ?? []);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <DashboardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          DB View
        </Typography>
      </Box>
      <Box sx={{ mb: 5 }}>
        <DataTable
          inputData={data}
          headLabel={[
            { id: 'name', label: 'DB Name' },
            { id: 'properties', label: 'Properties' },
            { id: '', label: 'Actions' },
          ]}
          cellRenderers={[
            undefined,
            (row) => (
              <Table size="small" sx={{ tableLayout: 'fixed', border: '1px solid #ddd' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'inherit', border: '1px solid #ddd', width: '50%' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'inherit', border: '1px solid #ddd', width: '30%' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'inherit', border: '1px solid #ddd', width: '20%' }}>Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.properties
                    .filter((p: any) => p.name !== '_id')
                    .map((p: any) => (
                      <TableRow key={p.name}>
                        <TableCell sx={{ border: '1px solid #ddd', width: '50%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</TableCell>
                        <TableCell sx={{ border: '1px solid #ddd', width: '30%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.type}</TableCell>
                        <TableCell sx={{ border: '1px solid #ddd', width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.required ? 'O' : '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ),
            (row) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpen(true);
                    const selected = data.find((c) => c.name === row.name);
                    setSelectedCollection(selected);
                  }}
                >
                  조회
                </Button>
              </Box>
            ),
          ]}
        />
      </Box>
      {selectedCollection && (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
            <span>컬렉션 데이터 상세 조회</span>
            <IconButton aria-label="닫기" onClick={() => setOpen(false)} size="small" sx={{ minWidth: 32, p: 0 }}>
              <Close color="error" />
            </IconButton>
          </DialogTitle>
          <DialogContent id="db-dialog-content">
            <DBDataView collection={selectedCollection} />
          </DialogContent>
        </Dialog>
      )}
    </DashboardContent>
  );
}
