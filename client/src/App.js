import React, { Component } from "react";
import PoolManagerContract from "./contracts/PoolManager.json";
import WethContract from "./contracts/Weth.json";
import DaiContract from "./contracts/Dai.json";
import MkrContract from "./contracts/Mkr.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import Header from "./components/Header.js";
import NavBar from './components/NavBar.js';
import Pool from './components/Pool.js';
import Status from './components/Status.js';

class App extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.createPool = this.createPool.bind(this)
    this.loadExistingPool = this.loadExistingPool.bind(this)
    this.approveToken = this.approveToken.bind(this)
  }
  
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    wethContract: null,
    daiContract: null,
    mkrContract: null,
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

      // Get the Pool Manager contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PoolManagerContract.networks[networkId];
      const instance = new web3.eth.Contract(
        PoolManagerContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Get Weth contract instance
      const networkId2 = await web3.eth.net.getId();
      const deployedNetwork2 = WethContract.networks[networkId2];
      const wethInstance = new web3.eth.Contract(
        WethContract.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );
      // Get Dai contract instance
      const networkId3 = await web3.eth.net.getId();
      const deployedNetwork3 = WethContract.networks[networkId3];
      const daiInstance = new web3.eth.Contract(
        DaiContract.abi,
        deployedNetwork3 && deployedNetwork3.address,
      );

      // Get Mkr contract instance
      const networkId4 = await web3.eth.net.getId();
      const deployedNetwork4 = WethContract.networks[networkId4];
      const mkrInstance = new web3.eth.Contract(
        MkrContract.abi,
              deployedNetwork4 && deployedNetwork4.address,
            );
      

      // Set web3, accounts, and contracts to the state
      this.setState({ 
        web3, 
        accounts, 
        contract: instance, 
        wethContract: wethInstance, 
        daiContract: daiInstance,
        mkrContract: mkrInstance, 
      });
      const { wethContract } = this.state;
      const { daiContract } = this.state;
      const { mkrContract } = this.state;


      // @ mint weth for owner
      await wethContract.methods.mint(accounts[0], web3.utils.toWei('100')).send({ from: accounts[0], gas: 5000000 });
      const wethSupply = await wethContract.methods.totalSupply().call();
      console.log("wethSupply", wethSupply);
      const wethOwnerBalance = await wethContract.methods.balanceOf(accounts[0]).call();
      console.log("weth owner balance: ", wethOwnerBalance)

      // @ mint dai for owner
      await daiContract.methods.mint(accounts[0], web3.utils.toWei('500')).send({ from: accounts[0], gas: 5000000 });
      const daiSupply = await daiContract.methods.totalSupply().call();
      console.log("daiSupply", daiSupply);
      const daiOwnerBalance = await daiContract.methods.balanceOf(accounts[0]).call();
      console.log("dai owner balance: ", daiOwnerBalance)

      // @ mint mkr for owner
      await mkrContract.methods.mint(accounts[0], web3.utils.toWei('50')).send({ from: accounts[0], gas: 5000000 });
      const mkrSupply = await mkrContract.methods.totalSupply().call();
      console.log("mkrSupply", mkrSupply);
      const mkrOwnerBalance = await mkrContract.methods.balanceOf(accounts[0]).call();
      console.log("mkri owner balance: ", mkrOwnerBalance)

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
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
  
  // @dev loads an existing smart pool and gets ready to manage it
  loadExistingPool = async () => {
    this.setState({ 
      bpoolAddress: this.state.bpoolToLoad 
    });
    this.setState({
      bpoolToLoad: ""
    });

  };

    // @dev approves a token for binding to smart pool
    approveToken = async () => {
      const { web3, accounts, contract } = this.state;
      console.log("hit approveToken")
      try {
        var _amount = web3.utils.toWei(this.state.amount);
        console.log("_amount: ", _amount)
  
      } catch (error) {
        alert(
          `Attempt to approve token failed. Check console for details.`,
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
        <Header />
        <NavBar bpoolAddress={this.state.bpoolAddress}/>
        <Status />
        <Pool 
          bpoolToLoad={this.state.bpoolToLoad} 
          handleChange={this.handleChange}
          createPool={this.createPool}
          loadExistingPool={this.loadExistingPool}
          approveToken={this.approveToken}
          token={this.state.token} 
          amount={this.state.amount} 
          denorm={this.state.denorm} 
        />
         
      </div>
    );
  }
}

export default App;
