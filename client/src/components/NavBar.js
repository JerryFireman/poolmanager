import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const NavBar = (props) => {
    return (
        <div>
             <AppBar
                position="static" 
                color="primary"
             >
                <Toolbar>
                    <Typography variant="h5" color="inherit" >
                        Current smart pool address: {props.bpoolAddress} 
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default NavBar;