import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});


export default function Status(props) {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" color="primary"  >
        Current smart pool status
      </Typography>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead variant="body1">
            <TableRow>
              <TableCell align="center"><strong>Token</strong></TableCell>
              <TableCell align="center"><strong>Balance</strong></TableCell>
              <TableCell align="center"><strong>Weight</strong></TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </div>
  );
}
