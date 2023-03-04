import { ethers, network } from "hardhat"
import { GOERLI_PUBLIC_KEYS } from "../../../helper-config"

async function token() {
    const account = network.config.accounts[2]
    const contractAddress = process.env.CASINO_TOKEN_ADDRESS || ""
    const Token = await ethers.getContractFactory("CasinoToken", account)
    const token = Token.attach(contractAddress)

    for (let i = 0; i < GOERLI_PUBLIC_KEYS.length; i++) {
        console.log((await token.balanceOf(GOERLI_PUBLIC_KEYS[i])).toString())
        console.log(
            (await ethers.provider.getBalance(GOERLI_PUBLIC_KEYS[i])).toString()
        )
    }
}

token()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
