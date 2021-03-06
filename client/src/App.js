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

//App controls the user interface
class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.createPool = this.createPool.bind(this);
    this.loadExistingPool = this.loadExistingPool.bind(this);
    this.approveToken = this.approveToken.bind(this);
  }

  state = {
    web3: null,
    accounts: null,
    contract: null,
    wethContract: null,
    daiContract: null,
    mkrContract: null,
    bpoolAddress: null,
    bpoolToLoad: "",
    tokenObject: {},
    statusArray: [],
    token: "",
    amount: "",
    denorm: "",
    swapFee: "",
    publicPrivate: "Private",
    swapFeeNavBar: "0.000001",
    tokenToApprove: "",
    approvalAmount: "",
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
      this.state.tokenObject["WETH"] = {};
      this.state.tokenObject["WETH"]["address"] = wethInstance.options.address;
      this.state.tokenObject["WETH"]["contract"] = "wethContract";

      // Get Dai contract instance
      const networkId3 = await web3.eth.net.getId();
      const deployedNetwork3 = DaiContract.networks[networkId3];
      const daiInstance = new web3.eth.Contract(
        DaiContract.abi,
        deployedNetwork3 && deployedNetwork3.address,
      );
      this.state.tokenObject["DAI"] = {};
      this.state.tokenObject["DAI"]["address"] = daiInstance.options.address;
      this.state.tokenObject["DAI"]["contract"] = "daiContract";

      // Get Mkr contract instance
      const networkId4 = await web3.eth.net.getId();
      const deployedNetwork4 = MkrContract.networks[networkId4];
      const mkrInstance = new web3.eth.Contract(
        MkrContract.abi,
        deployedNetwork4 && deployedNetwork4.address,
      );
      this.state.tokenObject["MKR"] = {};
      this.state.tokenObject["MKR"]["address"] = mkrInstance.options.address;
      this.state.tokenObject["MKR"]["contract"] = "mkrContract";

      // Set web3, accounts, and contracts to the state
      this.setState({
        web3,
        accounts,
        contract: instance,
        wethContract: wethInstance,
        daiContract: daiInstance,
        mkrContract: mkrInstance,
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, contract or tokens. Check console for details.`,
      );
      console.error(error);
    }
  };

  // This function updates state in response to user input
  handleChange = async (e) => {
    this.setState({ [e.target.name]: e.target.value });
    console.log(e.target.name, ": ", e.target.value);
  }



  // @dev Creates a new smart pool and gets ready to manage it
  createPool = async () => {
    const { web3, accounts} = this.state;
    try {
      const tx = await this.state.contract.methods.createPool().send({ from: accounts[0], gas: 6000000 });
      this.setState({ bpoolAddress: tx.events.PoolCreated.returnValues.bpoolAddress });
      const { contract } = this.state;
      const { wethContract } = this.state;
      const { daiContract } = this.state;
      const { mkrContract } = this.state;

      // @ mint weth for poolmanager contract
      await wethContract.methods.mint(accounts[0], web3.utils.toWei('100')).send({ from: accounts[0] });
      await this.state.wethContract.methods.mint(contract.options.address, web3.utils.toWei('80')).send({ from: accounts[0] });

      // @ mint dai for poolmanager contract
      await daiContract.methods.mint(accounts[0], web3.utils.toWei('600')).send({ from: accounts[0] });
      await daiContract.methods.mint(contract.options.address, web3.utils.toWei('500')).send({ from: accounts[0] });

      // @ mint mkr for poolmanager contract
      await mkrContract.methods.mint(accounts[0], web3.utils.toWei('60')).send({ from: accounts[0] });
      await mkrContract.methods.mint(contract.options.address, web3.utils.toWei('50')).send({ from: accounts[0] });
      await this.currentStatus()
      this.setState({
        publicPrivate : "Private",
        swapFeeNavBar: "0.000001"
      })

    } catch (error) {
      alert(
        `Attempt to create new smart pool failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // loads an existing smart pool and gets ready to manage it
  loadExistingPool = async () => {
    const { web3} = this.state;
    this.setState({
      bpoolAddress: this.state.bpoolToLoad,
      bpoolToLoad: "",
    });
    var isPublic = await this.state.contract.methods.isPublic(this.state.bpoolAddress).call();
    if (isPublic) {
      this.setState({publicPrivate: "Public"})
    } else {
      this.setState({publicPrivate: "Private"})
    };
    var swapFee = await this.state.contract.methods.swapFee(this.state.bpoolAddress).call();
    swapFee = web3.utils.fromWei(swapFee.toString());
    this.setState({
      swapFeeNavBar: swapFee,
    });
    isPublic = await this.state.contract.methods.isPublic(this.state.bpoolAddress).call();
    if (isPublic) {
      this.setState({publicPrivate: "Public"})
    } else {
      this.setState({publicPrivate: "Private"})
    };
  }

  // @dev approves a token for binding to smart pool
  approveToken = async () => {
    const { web3, accounts, contract } = this.state;
    try {
      var _token = this.state.tokenObject[this.state.tokenToApprove]["address"];
      var _amount = web3.utils.toWei(this.state.approvalAmount.toString());
      await contract.methods.approveToken(_token, this.state.bpoolAddress, _amount).send({ from: accounts[0] });
      this.setState({
        tokenToApprove: "",
        approvalAmount: "",
      });
      await this.currentStatus();
    } catch (error) {
      alert(
        `Attempt to approve token failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // binds a token to smart pool
  bindToken = async () => {
    const { web3, accounts, contract } = this.state;
    try {
      var _token = _token = this.state.tokenObject[this.state.token]["address"];
      var _amount = web3.utils.toWei(this.state.amount.toString());
      var _denorm = web3.utils.toWei(this.state.denorm.toString());
      await contract.methods.bindToken(this.state.bpoolAddress, _token, _amount, _denorm).send({ from: accounts[0], gas: 5000000 });
      this.setState({
        token: "",
        amount: "",
        denorm: "",
      });
      await this.currentStatus();
    } catch (error) {
      alert(
        `Attempt to bind token failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // @dev rebinds a token to smart pool
  rebindToken = async () => {
    const { web3, accounts, contract } = this.state;
    try {
      var _token = this.state.tokenObject[this.state.token]["address"];
      var _amount = web3.utils.toWei(this.state.amount.toString());
      var _denorm = web3.utils.toWei(this.state.denorm.toString());
      await contract.methods.rebindToken(this.state.bpoolAddress, _token, _amount, _denorm).send({ from: accounts[0], gas: 5000000 });
      this.setState({
        token: "",
        amount: "",
        denorm: "",
      });
      await this.currentStatus()
    } catch (error) {
      alert(
        `Attempt to bind token failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // @dev unbinds a token from smart pool
  unbindToken = async () => {
    const { accounts, contract } = this.state;
    try {
      var _token = this.state.tokenObject[this.state.token]["address"];
      await contract.methods.unbindToken(this.state.bpoolAddress, _token).send({ from: accounts[0], gas: 5000000 });
      console.log(_token + " is bound: " + await contract.methods.checkToken(this.state.bpoolAddress, _token).call());
      this.setState({
        token: "",
        amount: "",
        denorm: "",
      });
    } catch (error) {
      alert(
        `Attempt to unbind token failed: ` + error
      );
      console.error(error);
    }
    await this.currentStatus()
  };

  // @dev sets swap fee in smart pool
  setFee = async () => {
    const { web3, accounts, contract } = this.state;
    try {
      var swapFee = await this.state.contract.methods.swapFee(this.state.bpoolAddress).call();
      var _swapFee = web3.utils.toWei(this.state.swapFee.toString());
      await contract.methods.setFee(this.state.bpoolAddress, _swapFee).send({ from: accounts[0], gas: 5000000 });
      swapFee = await this.state.contract.methods.swapFee(this.state.bpoolAddress).call();
      swapFee = web3.utils.fromWei(swapFee.toString());
      this.setState({
        swapFeeNavBar: swapFee,
        swapFee: "",
      });
    } catch (error) {
      alert(
        `Attempt to set swap fee failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // @dev builds an array with current status of smart pool being managed
  currentStatus = async () => {
    const { contract, web3, bpoolAddress, tokenObject } = this.state;
    try {
      var statusArray = [];
     for (var i = 0; i < Object.keys(tokenObject).length; i++) {
        var statusLine = [];
        statusLine.push(i);
        statusLine.push(Object.keys(tokenObject)[i]);
        var tokenContract = tokenObject[Object.keys(tokenObject)[i]]["contract"];
        var poolmanagerBalance = await this.state[tokenContract].methods.balanceOf(contract.options.address).call();
        poolmanagerBalance = web3.utils.fromWei(poolmanagerBalance);
        statusLine.push(poolmanagerBalance);
        var allowance = await this.state[tokenContract].methods.allowance(contract.options.address, bpoolAddress).call();
        allowance = web3.utils.fromWei(allowance);
        statusLine.push(allowance);
        var tokenBound = await contract.methods.checkToken(bpoolAddress, this.state[tokenContract].options.address).call();
        if (tokenBound) {
          var tokenBalance = await contract.methods.tokenBalance(bpoolAddress, this.state[tokenContract].options.address).call();
          tokenBalance = web3.utils.fromWei(tokenBalance)
          statusLine.push(tokenBalance);
          var normWeight = await contract.methods.normalizedWeight(bpoolAddress, this.state[tokenContract].options.address).call();
          normWeight = web3.utils.fromWei(normWeight)
          statusLine.push(normWeight);
          var denormWeight = await contract.methods.denormalizedWeight(bpoolAddress, this.state[tokenContract].options.address).call();
          denormWeight = web3.utils.fromWei(denormWeight)
          statusLine.push(denormWeight);
        } else  {
          statusLine.push("0");
          statusLine.push("0");
          statusLine.push("0");
        }
        statusArray.push(statusLine);
      }
       this.setState({
        statusArray: statusArray,
      });
    } catch (error) {
      alert(
        `Attempt to update the current status of the smart pool failed. Check console for details.`,
      );
      console.error(error);
    }
  };

  // @dev changes status from public to private or vice versa
  setPublic = async () => {
    const { accounts, contract } = this.state;
    try {
      var isPublic = await this.state.contract.methods.isPublic(this.state.bpoolAddress).call();
      var _isPublic = !isPublic;
      await contract.methods.setPublic(this.state.bpoolAddress, _isPublic).send({ from: accounts[0], gas: 5000000 });
      isPublic = await this.state.contract.methods.isPublic(this.state.bpoolAddress).call();
      if (isPublic) {
        this.setState({publicPrivate: "Public"})
      } else {
        this.setState({publicPrivate: "Private"})
      };
    } catch (error) {
      alert(
        `Attempt to change the public/private status of the smart pool failed. Check console for details.`,
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
        <NavBar 
          bpoolAddress={this.state.bpoolAddress}
          publicPrivate={this.state.publicPrivate} 
          swapFeeNavBar={this.state.swapFeeNavBar}
        />
        <Status 
          bpoolAddress={this.state.bpoolAddress}
          statusArray={this.state.statusArray}
        />
        <Pool
          bpoolToLoad={this.state.bpoolToLoad}
          handleChange={this.handleChange}
          createPool={this.createPool}
          loadExistingPool={this.loadExistingPool}
          approveToken={this.approveToken}
          bindToken={this.bindToken}
          rebindToken={this.rebindToken}
          unbindToken={this.unbindToken}
          setFee={this.setFee}
          setPublic={this.setPublic}
          token={this.state.token}
          amount={this.state.amount}
          denorm={this.state.denorm}
          swapFee={this.state.swapFee}
          tokenToApprove={this.state.tokenToApprove}
          approvalAmount={this.state.approvalAmount}        />
      </div>
    );
  };
}

export default App;