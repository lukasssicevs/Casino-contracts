import { ethers, network } from "hardhat"

async function withdraw() {
    const accounts = await ethers.getSigners()
    const lottery = await ethers.getContract("Lottery")
    const token = await ethers.getContract("CasinoToken")

    const CSN_TO_WITHDRAW = 2000000

    console.log((await lottery.totalFunds()).toNumber())

    console.log(
        "-----------------------------------------------------------------------"
    )

    const withdrawTx = await lottery.withdraw(CSN_TO_WITHDRAW)

    await withdrawTx.wait(1)

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

withdraw()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
