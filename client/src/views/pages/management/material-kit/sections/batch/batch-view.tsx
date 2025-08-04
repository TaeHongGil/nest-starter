import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';

import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify/iconify';
import ServerApi from '@root/common/util/server.api';
import { CronJobData } from 'nestjs-api-axios';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export function BatchView() {
  const [jobs, setJobs] = useState<CronJobData[]>([]);
  const REFRESH_TIME = 10;
  const [refreshRemainingTime, setRefreshRemainingTime] = useState<number>(REFRESH_TIME);
  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [editValues, setEditValues] = useState<{ cronTime: string; active: boolean }>({ cronTime: '', active: false });

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await ServerApi.Cron.cronControllerGetJobs();
      setJobs(response.data.data?.jobs ?? []);
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

  const handleEditClick = (job: any) => {
    setEditJob(job);
    setEditValues({ cronTime: job.cronTime, active: job.active });
    setEditOpen(true);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    const response = await ServerApi.Cron.cronControllerUpdateDataSyncCronJob({
      name: editJob.name,
      cronTime: editValues.cronTime,
      active: editValues.active,
    });
    setEditOpen(false);
    if (response.data.data?.jobs) setJobs(response.data.data.jobs);
  };

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
          { id: 'active', label: 'Active' },
          { id: 'action', label: 'Action' },
        ]}
        cellRenderers={[
          undefined,
          undefined,
          (row) => (row.beforeDate ? new Date(row.beforeDate).toLocaleString() : '-'),
          (row) => (row.nextDate ? new Date(row.nextDate).toLocaleString() : '-'),
          (row) => <Iconify icon={row.active ? 'solar:check-circle-bold' : 'solar:eye-closed-bold'} sx={{ color: row.active ? 'success.main' : 'text.disabled', fontSize: 24 }} />,
          (row) => (
            <>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={async () => {
                  await ServerApi.Cron.cronControllerExecuteJob({ name: row.name });
                }}
                sx={{ mr: 1 }}
              >
                Execute
              </Button>
              <Button variant="contained" color="secondary" size="small" onClick={() => handleEditClick(row)}>
                Edit
              </Button>
            </>
          ),
        ]}
      />
      <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)} sx={{ zIndex: 1301 }}>
        <Box sx={{ p: 3, width: 360 }}>
          <Typography variant="h6" gutterBottom>
            Edit Job
          </Typography>
          <Stack spacing={2}>
            {editJob && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {editJob.name}
              </Typography>
            )}
            <TextField label="Cron Time" value={editValues.cronTime} onChange={(e) => handleEditChange('cronTime', e.target.value)} fullWidth />
            <FormControlLabel control={<Switch checked={editValues.active} onChange={(e) => handleEditChange('active', e.target.checked)} />} label="Active" />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleEditSave}>
                Save
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </DashboardContent>
  );
}
