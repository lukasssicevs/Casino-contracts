import { ethers, network } from "hardhat"

async function accounting() {
    const accounts = await ethers.getSigners()
    const lottery = await ethers.getContract("Lottery")
    const token = await ethers.getContract("CasinoToken")

    for (let i = 0; i < accounts.length; i++) {
        console.log((await lottery.fundsOf(accounts[i].address)).toNumber())
    }

    console.log(
        "-----------------------------------------------------------------------"
    )

    console.log((await lottery.totalFunds()).toNumber())
    //console.log(await lottery.participants())
}

accounting()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
