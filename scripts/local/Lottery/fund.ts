import { ethers, network } from "hardhat"

async function fund() {
    const accounts = await ethers.getSigners()
    const lottery = await ethers.getContract("Lottery")
    const token = await ethers.getContract("CasinoToken")

    const CSN_TO_FUND = 60000

    console.log((await lottery.totalFunds()).toNumber())

    console.log(
        "-----------------------------------------------------------------------"
    )

    await token.connect(accounts[0]).approve(lottery.address, CSN_TO_FUND)

    const fundTx = await lottery.connect(accounts[0]).fund(CSN_TO_FUND)

    await fundTx.wait(1)

    for (let i = 0; i < accounts.length; i++) {
        console.log((await lottery.fundsOf(accounts[i].address)).toNumber())
    }

    console.log(
        "-----------------------------------------------------------------------"
    )

    for (let i = 0; i < accounts.length; i++) {
        console.log((await token.balanceOf(accounts[i].address)).toNumber())
    }

    console.log(
        "-----------------------------------------------------------------------"
    )

    console.log((await lottery.totalFunds()).toNumber())

    console.log(
        "-----------------------------------------------------------------------"
    )

    console.log((await token.balanceOf(lottery.address)).toNumber())
}

fund()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
