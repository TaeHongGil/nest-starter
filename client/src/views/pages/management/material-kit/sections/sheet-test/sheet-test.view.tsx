import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CommonUtil from '@root/common/util/common.util';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';
import { Label } from '@root/views/pages/management/material-kit/components/label';
import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';
import { ApiEndpoints } from '@root/views/pages/management/store/api.endpoints';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import { useState } from 'react';

// ----------------------------------------------------------------------

export function SheetTestView() {
  const [url, setUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [range, setRange] = useState('');
  const [sheetData, setSheetData] = useState<string[][]>([]);

  const fetchSheetData = async () => {
    const response = await managementStore.sendRequest(ApiEndpoints.GET_SHEET_DATA, { url, sheet_name: sheetName, range });
    setSheetData(response?.data || []);
  };

  return (
    <DashboardContent maxWidth={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Sheet Test
        </Typography>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchSheetData();
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField name="sheet_url" label="URL" value={url} onChange={(e) => setUrl(e.target.value)} autoComplete="on" fullWidth sx={{ maxWidth: '600px' }} />
          <TextField name="sheet_name" label="Sheet Name" value={sheetName} onChange={(e) => setSheetName(e.target.value)} autoComplete="on" />
          <TextField name="sheet_range" label="Range" value={range} onChange={(e) => setRange(e.target.value)} autoComplete="on" />
          <Button type="submit" variant="contained">
            Fetch Data
          </Button>
        </Box>
      </form>

      {sheetData.length > 0 ? (
        <TableContainer>
          <Table sx={{ tableLayout: 'auto', whiteSpace: 'nowrap', border: 1, borderColor: 'grey.700' }}>
            <TableHead>
              <TableRow>
                {sheetData[0]?.map((header, index) => (
                  <TableCell key={index} sx={{ border: 1, borderColor: 'grey.700', backgroundColor: 'grey.300', fontWeight: 'bold', color: 'black' }}>
                    {header || ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sheetData.slice(1).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ whiteSpace: 'nowrap', border: 1, borderColor: 'grey.700', color: 'black' }}>
                      {cell || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <Label
            color="primary"
            variant="inverted"
            sx={{
              fontSize: '20px',
              cursor: 'pointer',
              ':hover': {
                transform: 'scale(1.05)',
              },
            }}
            endIcon={<Iconify icon="mingcute:copy-line" />}
            onClick={() => CommonUtil.copyToClipboard(managementStore.platformInfo?.google.client_email || '')}
          >
            <span>{managementStore.platformInfo?.google.client_email || ''}</span>
          </Label>
          <Typography variant="subtitle1" sx={{ m: 2 }}>
            시트 편집자에 해당 계정을 추가해주세요.
          </Typography>
          <img src="/client/management/assets/images/sheet-example/example.png" alt="Loading" />
        </Box>
      )}
    </DashboardContent>
  );
}
