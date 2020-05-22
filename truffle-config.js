const path = require("path");
require('dotenv').config();
const PrivateKeyProvider = require("truffle-privatekey-provider");
const privateKey = process.env.privateKey;
const infuraApiKey = process.env.infuraApiKey;
var provider = new PrivateKeyProvider(privateKey, infuraApiKey);

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    // initialize ganache-cli with ganache-cli -l 10000000 --account="11E74CD4FAEDE6AFFABE0D36645DB3372C1A37A376AEC237B85FCD2EB62318A9,100000000000000000000"
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    kovan: {
      provider: provider,
      gas: 3000000,
      gasPrice: 10000000000,
      network_id: 42,
    },

  },
  compilers: {
    solc: {
        version: '0.5.12',
        settings: { // See the solidity docs for advice about optimization and evmVersion
            optimizer: {
                enabled: true,
                runs: 100,
            },
            evmVersion: 'byzantium',
        },
    },
},

};

/*

module.exports = {
    networks: {
        contracts_build_directory: path.join(__dirname, "./client/src/contracts"),
        // initialize ganache-cli with --account="<private key>,100000000000000000000"
        development: {
            host: 'localhost', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*', // Any network (default: none)
            gas: 10000000,
        },
        coverage: {
            host: 'localhost',
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        },
        kovan: {
            provider: provider,
            gas: 3000000,
            gasPrice: 10000000000,
            network_id: 42,
          },      
    },
    // Configure your compilers
    compilers: {
        solc: {
            version: '0.5.12',
            settings: { // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 100,
                },
                evmVersion: 'byzantium',
            },
        },
    },
};
*/