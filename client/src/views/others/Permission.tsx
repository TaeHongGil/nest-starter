import { CardContent } from '@mui/material';
import { ReactElement } from 'react';

export default function Permission(): ReactElement {
  return (
    <CardContent>
      <h1>No Permission</h1>
      <p>You do not have the required permissions to access this page.</p>
    </CardContent>
  );
}
