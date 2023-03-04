import { ethers, network, run } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { CasinoToken__factory, Lottery__factory } from "../typechain-types"
import { networkConfig, developmentChains } from "../helper-config"
import "@nomiclabs/hardhat-etherscan"

const deployLottery: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, network } = hre
    const { deploy, log, get } = deployments
    const deployers = await ethers.getSigners()

    let vrfCoordinatorAddress,
        subscriptionId,
        vrfCoordinator,
        casinoToken,
        casinoTokenAddress,
        deployer

    const chainId = network.config.chainId as number

    if (developmentChains.includes(network.name)) {
        deployer = deployers[0].address
        casinoToken = await ethers.getContract("CasinoToken")
        casinoTokenAddress = casinoToken.address
        // Get VRF contract and create a subscription
        vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorAddress = vrfCoordinator.address
        const txResponse = await vrfCoordinator.createSubscription()
        const txReceipt = await txResponse.wait(1)
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    } else {
        deployer = network.config.accounts[0]
        casinoTokenAddress = networkConfig[chainId]["casinoToken"]
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const lottery = await deploy("Lottery", {
        contract: "Lottery",
        from: deployer,
        args: [
            casinoTokenAddress,
            vrfCoordinatorAddress,
            networkConfig[chainId].gasLane,
            subscriptionId,
            networkConfig[chainId].callbackGasLimit,
            networkConfig[chainId].cron,
        ],
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    })

    console.log("Lottery deployed!")

    if (developmentChains.includes(network.name) && vrfCoordinator) {
        // Fund the subscription
        const VRF_FUNDING = ethers.utils.parseEther("20")
        await vrfCoordinator.fundSubscription(subscriptionId, VRF_FUNDING)
        await vrfCoordinator.addConsumer(subscriptionId, lottery.address)
    }

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...")
        await verify(lottery.address, [
            casinoTokenAddress,
            vrfCoordinatorAddress,
            networkConfig[chainId].gasLane,
            subscriptionId,
            networkConfig[chainId].callbackGasLimit,
            networkConfig[chainId].cron,
        ])
    }
}

const verify = async (contractAddress: string, args: any) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

export default deployLottery
