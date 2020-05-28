import React, { Component } from "react";
import PoolManagerContract from "./contracts/PoolManager.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import Header from "./components/Header.js";
import NavBar from './components/NavBar.js';
import Pool from './components/Pool.js';
import Status from './components/Status.js';


class App extends Component {
  constructor(props) {
    super(props)
    this.setValue = this.setValue.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    bpoolAddress: "",
    bpoolToLoad: "", 
    token: "",
    amount: "",
    denorm: "",
  };

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
   // await contract.methods.set(this.state.value).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
   // const response = await contract.methods.get().call();

    // Update state with the result.
  //  this.setState({ storageValue: response });
  };

  handleChange = async (e) => {
    //e.preventDefault()
    this.setState({ [e.target.name]: e.target.value })
    console.log(e.target.name, ": ", e.target.value)
    console.log("this.state.value", this.state.value)
  }

    // @dev Creates a new smart pool and gets ready to manage it
    createPool = async () => {
      const { accounts, contract } = this.state;
      try {
        const tx = await contract.methods.createPool().send({ from: accounts[0], gas: 6000000 });
        console.log("tx",tx)
        console.log("bPoolAddress: ",tx.events.PoolCreated.returnValues.bpoolAddress)
        this.setState({ bpoolAddress: tx.events.PoolCreated.returnValues.bpoolAddress });
        console.log("this.state.bpoolAddress", this.state.bpoolAddress)

      } catch (error) {
        alert(
          `Attempt to create new smart pool failed. Check console for details.`,
        );
        console.error(error);
      }
    };
  
    // @dev Creates a new smart pool and gets ready to manage it
    loadExistingPool = async () => {
      this.setState({ 
        bpoolAddress: this.state.bpoolToLoad 
      });
      this.setState({
        bpoolToLoad: ""
      });

    };
  

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Header />
        <NavBar bpoolAddress={this.state.bpoolAddress}/>
        <Status />
        <Pool 
          bpoolToLoad={this.state.bpoolToLoad} 
          handleChange={this.handleChange}
          createPool={this.createPool}
          loadExistingPool={this.loadExistingPool}
          token={this.state.token} 
          amount={this.state.amount} 
          denorm={this.state.denorm} 
        />
         
      </div>
    );
  }
}

export default App;
