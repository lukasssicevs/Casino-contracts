import { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains } from "../helper-config"

const deployVrfMock: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, network } = hre
    const { deploy, log, get } = deployments
    const deployers = await ethers.getSigners()

    if (network.config.chainId === 31337) {
        const BASE_FEE = ethers.utils.parseEther("0.25")
        const GAS_PRICE_LINK = 1e9

        const vfrCoordinator = await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployers[0].address,
            args: [BASE_FEE, GAS_PRICE_LINK],
            waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
        })

        console.log("VRF Coordinator mock contract deployed!")
    }
}

export default deployVrfMock
