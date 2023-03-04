import { ethers, network } from "hardhat"
import { GOERLI_PUBLIC_KEYS } from "../../../helper-config"

async function token() {
    const account = network.config.accounts[2]
    console.log(account)
    const contractAddress = process.env.CASINO_TOKEN_ADDRESS || ""
    const Token = await ethers.getContractFactory("CasinoToken", account)
    const token = Token.attach(contractAddress)

    const ETHER_SUPPLIED = ethers.utils.parseEther("0.00000000003")
    const accountPubKey = "0x0ca38E62A2367C22d5DA898503DD72449BdFEd00"

    // const mintTx = await token.mint(accountPubKey, {
    //     value: ETHER_SUPPLIED,
    // })

    // await mintTx.wait(1)

    // console.log((await token.etherBacking()).toNumber())
    // console.log((await token.totalSupply()).toNumber())
    // console.log((await token.balanceOf(accountPubKey)).toNumber())
    // console.log(await token.symbol())
    for (let i = 0; i < 3; i++) {
        console.log((await token.balanceOf(GOERLI_PUBLIC_KEYS[i])).toNumber())
    }
}

token()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
