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
        border: 1,
        borderColor: 'divider',
        overflow: 'auto',
        maxWidth: '100%',
        boxShadow: '0 1px 2px rgba(28, 36, 51, 0.05)',
      }}
    >
      <Table size="small" stickyHeader>
        {children}
      </Table>
    </TableContainer>
  );
}
