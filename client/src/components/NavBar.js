import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const NavBar = (props) => {
    if (props.bpoolAddress)  {
        return (
            <div>
                <AppBar
                    position="static" 
                    color="primary"
                >
                    <Toolbar align="center">
                        <Typography  variant="h5" color="inherit" >
                            Smart pool address: {props.bpoolAddress} &nbsp; &nbsp; &nbsp; Status: {props.publicPrivate} &nbsp; &nbsp; &nbsp; Swap fee: {props.swapFeeNavBar}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        )
    } else {
        return (
            <div>
                <AppBar
                    position="static" 
                    color="primary"
                >
                    <Toolbar>
                        <Typography variant="h5" color="inherit" >
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        )
    }
}

export default NavBar;