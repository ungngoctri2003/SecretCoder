/* eslint-disable react-refresh/only-export-components -- adminHeaderCellSx/adminBodyRowSx consumed by DashboardAdmin */
import { Paper, Table, TableContainer } from '@mui/material';

/** Table head cells: sx={{ ...adminHeaderCellSx, ... }} */
export const adminHeaderCellSx = {
  fontWeight: 700,
  fontSize: '0.8125rem',
  bgcolor: 'action.hover',
  borderBottom: 2,
  borderColor: 'divider',
  py: 1.25,
  whiteSpace: 'nowrap',
};

/** Table body row */
export const adminBodyRowSx = {
  transition: 'background-color 0.15s ease',
  '&:hover': { bgcolor: 'action.hover' },
};

export function AdminDataTable({ children }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'auto',
        maxWidth: '100%',
        boxShadow: (t) => t.shadows[1],
      }}
    >
      <Table size="small" stickyHeader>
        {children}
      </Table>
    </TableContainer>
  );
}
