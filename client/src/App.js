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
    token: "WETH",
    amount: "0",
    denorm: "0",
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

      console.log("weth address: ",wethInstance.options.address)


 
      // Get Dai contract instance
      const networkId3 = await web3.eth.net.getId();
      const deployedNetwork3 = DaiContract.networks[networkId3];
      const daiInstance = new web3.eth.Contract(
        DaiContract.abi,
        deployedNetwork3 && deployedNetwork3.address,
      );
      console.log("dai address: ",daiInstance.options.address)



      // Get Mkr contract instance
      const networkId4 = await web3.eth.net.getId();
      const deployedNetwork4 = MkrContract.networks[networkId4];
      const mkrInstance = new web3.eth.Contract(
        MkrContract.abi,
              deployedNetwork4 && deployedNetwork4.address,
            );
      console.log("mkr address: ",mkrInstance.options.address)
      
                  
      

      // Set web3, accounts, and contracts to the state
      this.setState({ 
        web3, 
        accounts, 
        contract: instance, 
        wethContract: wethInstance, 
        daiContract: daiInstance,
        mkrContract: mkrInstance, 
      });
      const { contract } = this.state;
      const { wethContract } = this.state;
      const { daiContract } = this.state;
      const { mkrContract } = this.state;


      // @ mint weth for poolmanager contract
      await wethContract.methods.mint(accounts[0], web3.utils.toWei('100')).send({ from: accounts[0] });
      await wethContract.methods.mint(contract.options.address, web3.utils.toWei('80')).send({ from: accounts[0] });      
      const wethSupply = await wethContract.methods.totalSupply().call();
      console.log("Total weth supply", wethSupply);
      const wethOwnerBalance = await wethContract.methods.balanceOf(accounts[0]).call();
      console.log("Owner weth balance: ", wethOwnerBalance)


      // @ mint dai for poolmanager contract
      await daiContract.methods.mint(accounts[0], web3.utils.toWei('600')).send({ from: accounts[0] });
      await daiContract.methods.mint(contract.options.address, web3.utils.toWei('500')).send({ from: accounts[0] });
      const daiSupply = await daiContract.methods.totalSupply().call();
      console.log("Total dai supply", daiSupply);
      const daiOwnerBalance = await daiContract.methods.balanceOf(accounts[0]).call();
      console.log("Owner dai balance: ", daiOwnerBalance)

      // @ mint mkr for poolmanager contract
      await mkrContract.methods.mint(accounts[0], web3.utils.toWei('60')).send({ from: accounts[0] });
      await mkrContract.methods.mint(contract.options.address, web3.utils.toWei('50')).send({ from: accounts[0] });
      const mkrSupply = await mkrContract.methods.totalSupply().call();
      console.log("Total mkr supply", mkrSupply);
      const mkrOwnerBalance = await mkrContract.methods.balanceOf(accounts[0]).call();
      console.log("Owner mkr balance: ", mkrOwnerBalance)

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
      bpoolAddress: this.state.bpoolToLoad, 
      bpoolToLoad: "",
    });
  };

    // @dev approves a token for binding to smart pool
    approveToken = async () => {
      const { web3, accounts, contract } = this.state;
      console.log("this.state.wethContract.options.address: ", this.state.wethContract.options.address)
      console.log("this.state.mkrContract.options.address: ", this.state.mkrContract.options.address)
      console.log("this.state.daiContract.options.address: ", this.state.daiContract.options.address)
      try {
        var _token;
        if (this.state.token === "MKR") {
          _token = this.state.mkrContract.options.address
        } else if (this.state.token === "WETH") {
          _token = this.state.wethContract.options.address
        } else if (this.state.token === "DAI") {
          _token = this.state.daiContract.options.address
        };
        var _amount = web3.utils.toWei(this.state.amount.toString());
        console.log("_token: ", _token)
        console.log("this.state.bpoolAddress: ", this.state.bpoolAddress)
        console.log("_amount: ", _amount)
        await contract.methods.approveToken(_token, this.state.bpoolAddress, _amount).send({ from: accounts[0] });
        const wethAllowance = await this.state.wethContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("wethAllowance: ", wethAllowance)
        const daiAllowance = await this.state.daiContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("daiAllowance: ", daiAllowance)
        const mkrAllowance = await this.state.mkrContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("mkrAllowance: ", mkrAllowance)
      } catch (error) {
        alert(
          `Attempt to approve token failed. Check console for details.`,
        );
        console.error(error);
      }
    };
    
    // @dev binds a token to smart pool
    bindToken = async () => {
      console.log("hit bind token")
      const { web3, accounts, contract } = this.state;
      console.log("this.state.wethContract.options.address: ", this.state.wethContract.options.address)
      console.log("this.state.mkrContract.options.address: ", this.state.mkrContract.options.address)
      console.log("this.state.daiContract.options.address: ", this.state.daiContract.options.address)
      try {
        var _token;
        if (this.state.token === "MKR") {
          _token = this.state.mkrContract.options.address
        } else if (this.state.token === "WETH") {
          _token = this.state.wethContract.options.address
        } else if (this.state.token === "DAI") {
          _token = this.state.daiContract.options.address
        };
        var _amount = web3.utils.toWei(this.state.amount.toString());
        var _denorm = web3.utils.toWei(this.state.denorm.toString());
        const wethPoolmanagerBalance = await this.state.wethContract.methods.balanceOf(contract.options.address).call();
        console.log("Poolmanager weth balance: ", wethPoolmanagerBalance)
        const daiPoolmanagerBalance = await this.state.daiContract.methods.balanceOf(contract.options.address).call();
        console.log("Poolmanager dai balance: ", daiPoolmanagerBalance)
        const mkrPoolmanagerBalance = await this.state.mkrContract.methods.balanceOf(contract.options.address).call();
        console.log("Poolmanager mkr balance: ", mkrPoolmanagerBalance)
        const wethAllowance = await this.state.wethContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("wethAllowance: ", wethAllowance)
        const daiAllowance = await this.state.daiContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("daiAllowance: ", daiAllowance)
        const mkrAllowance = await this.state.mkrContract.methods.allowance(contract.options.address, this.state.bpoolAddress).call()
        console.log("mkrAllowance: ", mkrAllowance)
        console.log("this.state.bpoolAddress: ", this.state.bpoolAddress)
        console.log("_token: ", _token);
        console.log("_amount: ", _amount);
        console.log("_denorm: ", _denorm);
        await contract.methods.bindToken(this.state.bpoolAddress, _token, _amount, _denorm).send({ from: accounts[0], gas: 5000000 });
        console.log(_token + " is bound: " + await contract.methods.checkToken(this.state.bpoolAddress, _token).call());
        console.log(_token + " amount bound: " + await contract.methods.tokenBalance(this.state.bpoolAddress, _token).call());
        console.log(_token + " normalized weight: " + await contract.methods.normalizedWeight(this.state.bpoolAddress, _token).call());
        console.log(_token + " denormalized weight: " + await contract.methods.denormalizedWeight(this.state.bpoolAddress, _token).call());
        this.setState({ 
          token: "WETH",
          amount: "0",
          denorm: "0",
              });  
        
      } catch (error) {
        alert(
          `Attempt to bind token failed. Check console for details.`,
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
          bindToken={this.bindToken}
          token={this.state.token} 
          amount={this.state.amount} 
          denorm={this.state.denorm} 
        />
         
      </div>
    );
  }
}

export default App;
