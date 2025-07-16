import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';

import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';
import { ApiEndpoints } from '@root/views/pages/management/store/api.endpoints';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export function BatchView() {
  const [jobs, setJobs] = useState([]);
  const REFRESH_TIME = 10;
  const [refreshRemainingTime, setRefreshRemainingTime] = useState<number>(REFRESH_TIME);

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await managementStore.sendRequest(ApiEndpoints.GET_JOBS, undefined, undefined, false);
      setJobs(response?.data?.jobs ?? []);
    };

    fetchJobs();

    const intervalId = setInterval(() => {
      fetchJobs();
      setRefreshRemainingTime(REFRESH_TIME);
    }, REFRESH_TIME * 1000);

    const countdownId = setInterval(() => {
      setRefreshRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4">Batch</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Typography variant="body1">{refreshRemainingTime}s</Typography>
          {refreshRemainingTime > 0 ? (
            <CircularProgress variant="determinate" value={(refreshRemainingTime / REFRESH_TIME) * 100} size={24} sx={{ ml: 1 }} />
          ) : (
            <CircularProgress size={24} sx={{ ml: 1 }} />
          )}
        </Box>
      </Box>

      <DataTable
        inputData={jobs}
        headLabel={[
          { id: 'name', label: 'Name' },
          { id: 'cronTime', label: 'Cron Time' },
          { id: 'beforeDate', label: 'Before Date' },
          { id: 'nextDate', label: 'Next Date' },
        ]}
        cellRenderers={[undefined, undefined, (row) => (row.beforeDate ? new Date(row.beforeDate).toLocaleString() : '-'), (row) => (row.nextDate ? new Date(row.nextDate).toLocaleString() : '-')]}
        popoverList={[
          {
            label: 'Execute',
            icon: <Iconify icon="material-symbols:play-arrow-rounded" width={24} />,
            onClick: async (row, close) => {
              console.log('Execute', row);
              await managementStore.sendRequest(ApiEndpoints.EXECUTE_JOBS, { name: row.name });
              close();
            },
          },
        ]}
      />
    </DashboardContent>
  );
}
