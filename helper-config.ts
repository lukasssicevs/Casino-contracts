import { ethers } from "hardhat"

export const networkConfig = {
    default: {
        name: "hardhat",
    },
    31337: {
        name: "localhost",
        subscriptionId: "1",
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
        callbackGasLimit: "2000000", // 400,000 gas
        cron: "0xa24DEb768C54084AD92E269d28fC64bFe41B77ae",
    },
    5: {
        name: "goerli",
        subscriptionId: "7996",
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
        callbackGasLimit: "200000", // 200,000 gas
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        casinoToken: "0x647b542609F48cc5dc2A3CE8F5DffF3aA2D5fEF8",
        lottery: "0x4117c9408D04c49D5f9367f3AFE5247030B99c07",
        cron: "0xa24DEb768C54084AD92E269d28fC64bFe41B77ae",
    },
    1: {
        name: "mainnet",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6
export const INITIAL_MINT = ethers.utils.parseEther("0.001")
export const GOERLI_PUBLIC_KEYS = [
    "0x84aB61156ca74f2b9be142E9b6a57A50A11c62A0",
    "0x3588dB4E1E17a944F178d94871D4912f687b8814",
    "0x0ca38E62A2367C22d5DA898503DD72449BdFEd00",
]
