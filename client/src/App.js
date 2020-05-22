import React, { Component } from "react";
import PoolManagerContract from "./contracts/PoolManager.json";
// truffleimport BFactory from "./contracts/BFactory.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props)
    this.setValue = this.setValue.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  
  state = { storageValue: 0, web3: null, accounts: null, contract: null, value: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PoolManagerContract.networks[networkId];
      const instance = new web3.eth.Contract(
        PoolManagerContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

//        instance.events.LogSet((error, event)=>{
//          console.log(event)
//        })

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  setValue = async (event) => {
    event.preventDefault()
    
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(this.state.value).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  handleChange = async (e) => {
    //e.preventDefault()
    this.setState({value: parseInt(e.target.value, 10)})
  }

    // @dev Executed by client to approve current phase
    createPool = async () => {
      const { accounts, contract } = this.state;
      try {
        const tx = await contract.methods.createPool().send({ from: accounts[0], gas: 6000000 });
        console.log("tx",tx)
        console.log("bPoolAddress: ",tx.events.PoolCreated.returnValues.bpoolAddress)
      } catch (error) {
        alert(
          `Attempt to create new smart pool failed. Check console for details.`,
        );
        console.error(error);
      }
    };
  
  

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2> 
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <form>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <button value="Submit" onClick={this.setValue} >Submit </button>
        </form>
        <div>The stored value is: {this.state.storageValue}</div>
        <br/>
        <button value="Create pool" onClick={this.createPool} >Create Pool </button>
         
      </div>
    );
  }
}

export default App;
