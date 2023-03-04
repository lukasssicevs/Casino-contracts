import { ethers, network } from "hardhat"
import { GOERLI_PUBLIC_KEYS } from "../helper-config"

const { ALCHEMY_API_KEY } = process.env

const provider = new ethers.providers.JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
)

const account = network.config.accounts[2]

const wallet = new ethers.Wallet(account, provider)

//console.log(wallet)

async function token() {
    const lotteryAddress = process.env.LOTTERY_ADDRESS || ""
    const Lottery = await ethers.getContractFactory("Lottery", account)
    const lottery = Lottery.attach(lotteryAddress)
    const tokenAddress = process.env.CASINO_TOKEN_ADDRESS || ""
    const Token = await ethers.getContractFactory("CasinoToken", account)
    const token = Token.attach(tokenAddress)

    //--------------------------------------------------------------------------

    // const CSN_TO_FUND = ethers.utils.parseEther("0.0000000005")

    // console.log((await lottery.totalFunds()).toNumber())

    // await token.connect(wallet).increaseAllowance(lottery.address, CSN_TO_FUND)

    // const fundTX = await lottery.connect(wallet).fund(CSN_TO_FUND)

    // await fundTX.wait(1)

    // console.log((await lottery.totalFunds()).toNumber())
    // console.log((await lottery.fundsOf(GOERLI_PUBLIC_KEYS[2])).toNumber())
    // console.log((await token.balanceOf(lotteryAddress)).toNumber())

    //---------------------------------------------------------------------------

    // for (let i = 0; i < 3; i++) {
    //     console.log((await lottery.fundsOf(GOERLI_PUBLIC_KEYS[i])).toNumber())
    // }
    // const payoutTx = await lottery.payOut({ gasLimit: 50000 })
    // await payoutTx.wait(1)
    // console.log(payoutTx)

    //---------------------------------------------------------------------------

    // const funds = [300000000, 200000000, 500000000]

    // console.log((await lottery.totalFunds()).toNumber())

    for (let i = 0; i < 3; i++) {
        // const wallet = new ethers.Wallet(network.config.accounts[i], provider)
        // const withdrawTx = await lottery.connect(wallet).withdraw(funds[i])
        // withdrawTx.wait(1)
        console.log((await lottery.fundsOf(GOERLI_PUBLIC_KEYS[i])).toNumber())
    }

    console.log(
        "-----------------------------------------------------------------------"
    )

    for (let i = 0; i < 3; i++) {
        console.log((await token.balanceOf(GOERLI_PUBLIC_KEYS[i])).toNumber())
    }

    console.log(
        "-----------------------------------------------------------------------"
    )

    console.log((await lottery.totalFunds()).toNumber())
}

token()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
