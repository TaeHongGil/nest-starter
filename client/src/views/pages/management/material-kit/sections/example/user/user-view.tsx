import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { _users } from '@root/views/pages/management/material-kit/_mock';
import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';

import { Avatar } from '@mui/material';
import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';
import { Label } from '@root/views/pages/management/material-kit/components/label';

// ----------------------------------------------------------------------

export function UserView() {
  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
        </Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mingcute:add-line" />}>
          New user
        </Button>
      </Box>

      <DataTable
        inputData={_users}
        headLabel={[
          { id: 'name', label: 'Name' },
          { id: 'company', label: 'Company' },
          { id: 'role', label: 'Role' },
          { id: 'isVerified', label: 'Verified', align: 'center' },
          { id: 'status', label: 'Status' },
        ]}
        cellRenderers={[
          (row) => (
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar alt={row.name} src={row.avatarUrl} />
              {row.name}
            </Box>
          ),
          undefined,
          undefined,
          (row) => (row.isVerified ? <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} /> : '-'),
          (row) => <Label color={(row.status === 'banned' && 'error') || 'success'}>{row.status}</Label>,
        ]}
        popoverList={[
          {
            label: 'Edit',
            icon: <Iconify icon="solar:pen-bold" width={20} />,
            onClick: (row, close) => {
              console.log('Edit', row);
              close();
            },
          },
          {
            label: 'Delete',
            icon: <Iconify icon="solar:trash-bin-trash-bold" width={20} />,
            color: 'error',
            onClick: (row, close) => {
              console.log('Delete', row);
              close();
            },
          },
        ]}
        showCheckbox
        onSelectRow={(rows) => {
          console.log('Selected rows:', rows);
        }}
      />
    </DashboardContent>
  );
}
