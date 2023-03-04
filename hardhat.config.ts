import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "hardhat-deploy"
import "solidity-coverage"
import "dotenv/config"

const ALCHEMY_API_KEY = "iwlvwZ7b7rp3ZnPzHdCnsV5NmcCNpZYM"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const GOERLI_PRIVATE_KEY_1 = process.env.GOERLI_PRIVATE_KEY_1 || ""
const GOERLI_PRIVATE_KEY_2 = process.env.GOERLI_PRIVATE_KEY_2 || ""
const GOERLI_PRIVATE_KEY_3 = process.env.GOERLI_PRIVATE_KEY_3 || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        goerli: {
            url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
            accounts: [
                GOERLI_PRIVATE_KEY_1,
                GOERLI_PRIVATE_KEY_2,
                GOERLI_PRIVATE_KEY_3,
            ],
            chainId: 5,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
}

export default config
