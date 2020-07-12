const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
     development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
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

