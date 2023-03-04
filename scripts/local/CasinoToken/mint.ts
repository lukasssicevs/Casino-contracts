import { ethers, network } from "hardhat"

async function mint() {
    const accounts = await ethers.getSigners()
    const token = await ethers.getContract("CasinoToken")

    const CSN_TO_MINT = 3000000
    const ETH_TO_SUPPLY = CSN_TO_MINT * 1e10

    console.log(ETH_TO_SUPPLY)

    const mintTx = await token.mint(accounts[2].address, CSN_TO_MINT, {
        value: ETH_TO_SUPPLY.toString(),
    })

    await mintTx.wait(1)

    console.log((await token.totalSupply()).toNumber())

    for (let i = 0; i < accounts.length; i++) {
        console.log((await token.balanceOf(accounts[i].address)).toString())
        console.log(
            (await ethers.provider.getBalance(accounts[i].address)).toString()
        )
    }
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
