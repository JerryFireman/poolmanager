import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 500,
  },
});


export default function Status(props) {
  const classes = useStyles();
  if (props.bpoolAddress)  {
    return (
      <div>
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead variant="body1">
              <TableRow>
                <TableCell align="center"><strong>Token</strong></TableCell>
                <TableCell align="center"><strong>Contract balance</strong></TableCell>
                <TableCell align="center"><strong>Allowance</strong></TableCell>
                <TableCell align="center"><strong>Balance</strong></TableCell>
                <TableCell align="center"><strong>Normalized weight</strong></TableCell>
                <TableCell align="center"><strong>Denormalized weight</strong></TableCell>
  
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </div>
    );
  } else {
    return null
  }

}
