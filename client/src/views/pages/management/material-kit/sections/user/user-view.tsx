import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '@root/views/pages/management/material-kit/layouts/dashboard';

import { Button } from '@mui/material';
import MessageUtil from '@root/common/util/message.util';
import { DataTable } from '@root/views/pages/management/material-kit/components/datatable/components';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';
import { ROLE } from '@root/views/pages/management/store/ManagementStore';
import ServerApi from '@root/views/pages/management/store/server.api';
import JSON5 from 'json5';
import { ReqAdminUpdateRoleRoleEnum, ResUser } from 'nestjs-api-axios';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export function UserView() {
  const [users, setUsers] = useState<ResUser[]>([]);
  const [filter, setFilter] = useState<Record<string, any>>({ limit: '100', page: '1', filter: '{}' });

  const fetchUsers = async () => {
    const response = await ServerApi.admin.adminControllerGetUsers(filter.limit, filter.page, filter.filter);
    setUsers(response.data.data?.users ?? []);
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
          <Button
            sx={{ ml: 2 }}
            variant="contained"
            color="inherit"
            onClick={async () => {
              const result = await MessageUtil.formDialogAsync('User Filter', filter);
              if (result) {
                try {
                  result.filter = JSON.stringify(JSON5.parse(result.filter));
                  setFilter(result);
                } catch (error: any) {
                  MessageUtil.error(`Invalid filter format. ${error.message}`);
                }
              }
            }}
          >
            filter
          </Button>
        </Typography>
      </Box>
      <DataTable
        inputData={users}
        headLabel={[
          { id: 'useridx', label: 'Useridx' },
          { id: 'nickname', label: 'Name' },
          { id: 'role', label: 'Role' },
        ]}
        cellRenderers={[undefined, undefined, (row) => ROLE[row.role]]}
        popoverList={[
          {
            label: 'Update Role',
            icon: <Iconify icon="solar:pen-bold" width={20} />,
            onClick: async (row, close) => {
              const result = await MessageUtil.formDialogAsync(`Update ${row.nickname}'s Role`, { role: row.role });
              if (result) {
                await ServerApi.admin.adminControllerUpdateUserRole({ useridx: row.useridx, role: Number(result.role) as ReqAdminUpdateRoleRoleEnum });
                fetchUsers();
              }
              close();
            },
          },
        ]}
      />
    </DashboardContent>
  );
}
