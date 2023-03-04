import { developmentChains, INITIAL_MINT } from "../helper-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers, run } from "hardhat"
import "@nomiclabs/hardhat-etherscan"

const deployCasinoToken: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, network } = hre
    const { deploy, log, get } = deployments
    const deployers = await ethers.getSigners()

    const casinoToken = await deploy("CasinoToken", {
        contract: "CasinoToken",
        from: deployers[0].address,
        value: INITIAL_MINT,
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    })

    console.log("Casino Token contract deployed!")

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...")
        await verify(casinoToken.address, [])
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

export default deployCasinoToken
