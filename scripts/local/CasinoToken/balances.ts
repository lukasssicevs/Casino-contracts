import { ethers } from "hardhat"

async function balances() {
    const token = await ethers.getContract("CasinoToken")
    const accounts = await ethers.getSigners()

    for (let i = 0; i < accounts.length; i++) {
        console.log((await token.balanceOf(accounts[i].address)).toNumber())
        // console.log(
        //     (await ethers.provider.getBalance(accounts[i].address)).toString()
        // )
    }
}

balances()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
