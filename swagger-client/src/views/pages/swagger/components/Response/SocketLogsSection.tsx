import { Box, Button, Card, Divider, Typography } from '@mui/material';
import { DataGrid, GridEventListener, useGridApiRef } from '@mui/x-data-grid';
import { observer } from 'mobx-react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Split from 'react-split';
import { protocolStore } from '../../store/ProtocolStore';

const SocketLogsSection: React.FC = observer(() => {
  const socketStore = protocolStore.socketStore;
  const logs = socketStore.getLogs();
  const [selectedIdx, setSelectedIdx] = useState<string | null>(null);
  const selectedLog = selectedIdx !== null ? logs[Number(selectedIdx)] : null;
  const apiRef = useGridApiRef();

  const prevLastLogStr = useRef<string>('');
  useEffect(() => {
    const lastLogStr = logs.length > 0 ? JSON.stringify(logs[logs.length - 1]) : '';
    if (apiRef.current && logs.length > 0 && lastLogStr !== prevLastLogStr.current) {
      setTimeout(() => {
        apiRef.current?.scrollToIndexes({ rowIndex: logs.length - 1 });
      });
    }
  }, [logs.length, apiRef]);

  const handleEvent: GridEventListener<'rowClick'> = (params, _event, _details) => {
    setSelectedIdx(params.id as string);
  };

  const renderLogDetail = (log: typeof selectedLog): ReactElement => {
    if (!log) return <Typography color="text.secondary">Select a log to see details.</Typography>;
    let formatted: string | undefined = undefined;
    try {
      const obj = JSON.parse(log.data);
      formatted = JSON.stringify(obj, undefined, 2);
    } catch {
      formatted = undefined;
    }

    return (
      <>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {log.date} [{log.type}] {log.namespace} {log.event}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {formatted ? formatted : log.data}
        </Typography>
      </>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <Typography variant="h6">Logs</Typography>
        <Button size="small" variant="contained" onClick={async () => socketStore.clearLogs()} sx={{ boxShadow: 'none', ':hover': { boxShadow: 'none' } }} disableRipple>
          Clear
        </Button>
      </div>
      <Divider />
      <Split direction="vertical" style={{ height: '100%' }} expandToMin={true} gutterSize={5} sizes={[70, 30]}>
        <DataGrid
          apiRef={apiRef}
          rows={logs.map((log, idx) => ({ id: String(idx), ...log }))}
          columns={[
            {
              field: 'date',
              headerName: 'Date',
              width: 160,
            },
            {
              field: 'type',
              headerName: 'Type',
              width: 80,
              renderCell: (params: any) => <span style={{ color: '#1976d2' }}>{params.value}</span>,
            },
            {
              field: 'namespace',
              headerName: 'Namespace',
              width: 100,
              renderCell: (params: any) => <span style={{ color: '#9c27b0' }}>{params.value}</span>,
            },
            {
              field: 'event',
              headerName: 'Event',
              width: 100,
              renderCell: (params: any) => <span style={{ color: '#9c27b0' }}>{params.value}</span>,
            },
            {
              field: 'data',
              flex: 1,
              headerName: 'Data',
            },
          ]}
          disableColumnSorting
          disableColumnFilter
          disableColumnMenu
          hideFooter
          sx={{ border: 'none', '& .MuiDataGrid-row:hover': { background: '#e3f2fd' }, '& .MuiDataGrid-row.Mui-selected': { background: '#e3f2fd' } }}
          onRowClick={handleEvent}
          getRowId={(row) => row.id}
        />
        <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>{renderLogDetail(selectedLog)}</Box>
      </Split>
    </Card>
  );
});

export default SocketLogsSection;
