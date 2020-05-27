import React, { Component } from "react";
import Typography from '@material-ui/core/Typography'


// @dev This component displays the header of the application in the user interface
class Header extends Component {
    render() {
        return (
            <div>
                <Typography variant="h1" color="primary" align="center" padding="20px">
                    Smart Pool Manager
                </Typography>
                <Typography variant="h6" color="textPrimary" align="center" padding="0px">
                Creating and managing Balancer pools from a smart contract using embedded control logic
                </Typography>
            </div>
        )
    }
}

export default Header;
        
