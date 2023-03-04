import { ethers, network } from "hardhat"

async function payout() {
    const accounts = await ethers.getSigners()
    const lottery = await ethers.getContract("Lottery")
    const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock")
    const token = await ethers.getContract("CasinoToken")

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

    console.log("--------------------------------------------------")

    console.log("Triggering payout...")

    await new Promise<void>(async (resolve, reject) => {
        lottery.on("PreviousPayout", async () => {
            try {
                console.log("Winner is picked!")
                resolve()
            } catch (e) {
                reject(e)
            }
        })

        const tx = await lottery.payOut()
        const txReceipt = await tx.wait(1)

        await vrfCoordinator.fulfillRandomWords("1", lottery.address)
    })

    // for (let i = 0; i < accounts.length; i++) {
    //     console.log((await lottery.fundsOf(accounts[i].address)).toNumber())
    // }

    // console.log(
    //     "-----------------------------------------------------------------------"
    // )

    // for (let i = 0; i < accounts.length; i++) {
    //     console.log((await token.balanceOf(accounts[i].address)).toNumber())
    // }

    console.log(
        "-----------------------------------------------------------------------"
    )

    console.log((await lottery.totalFunds()).toNumber())
}

payout()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
