import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
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
            <TableBody variant="body1">
            {props.currentStatus.map((row) => (
              <TableRow key={row[0]}>
                <TableCell component="th" scope="row">
                  {row[1]}
                </TableCell>
                <TableCell align="right">{row[2]}</TableCell>
                <TableCell align="right">{row[3]}</TableCell>
                <TableCell align="right">{row[4]}</TableCell>
                <TableCell align="right">{row[5]}</TableCell>
                <TableCell align="right">{row[6]}</TableCell>

              </TableRow>
            ))}
          </TableBody>

          </Table>
        </TableContainer>
      </div>
    );
  } else {
    return null
  }

}
