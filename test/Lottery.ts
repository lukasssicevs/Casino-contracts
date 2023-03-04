import { expect } from "chai"
import { ethers, network } from "hardhat"
import {
    CasinoToken,
    CasinoToken__factory,
    Lottery,
    Lottery__factory,
} from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { networkConfig } from "../helper-config"

describe("Lottery", function () {
    let casinoToken: CasinoToken
    let casinoTokenFactory: CasinoToken__factory
    let lottery: Lottery
    let lotteryFactory: Lottery__factory
    let deployers: SignerWithAddress[]
    let vrfCoordinator: any
    let subscriptionId: string
    const INITIAL_SUPPLY = ethers.utils.parseEther("0.000000003")

    beforeEach(async () => {
        deployers = await ethers.getSigners()
        casinoToken = await ethers.getContract("CasinoToken")
        vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock")
        lottery = await ethers.getContract("Lottery")
    })
    it("Single player's funds should equal the amount he funded", async function () {
        const CSN_TO_FUND = 4000000
        const TIMES_FUNDED = 5
        for (let i = 0; i < TIMES_FUNDED; i++) {
            await casinoToken
                .connect(deployers[1])
                .increaseAllowance(lottery.address, CSN_TO_FUND)
            await lottery.connect(deployers[1]).fund(CSN_TO_FUND)
        }

        const totalFunded = await lottery.fundsOf(deployers[1].address)

        expect(CSN_TO_FUND * TIMES_FUNDED).to.equal(totalFunded.toNumber())
    })
    it("Should revert funding if amount smaller than minimum requirement", async function () {
        const CSN_TO_FUND = 4
        await casinoToken.increaseAllowance(lottery.address, CSN_TO_FUND)
        await expect(lottery.fund(CSN_TO_FUND)).to.be.revertedWith(
            "Insufficient funding"
        )
    })
    it("Should emit event of adding a new participant if it is his first time funding the lottery", async function () {
        const CSN_TO_FUND = 3000000
        await casinoToken.increaseAllowance(lottery.address, CSN_TO_FUND)
        await expect(lottery.fund(CSN_TO_FUND)).to.emit(
            lottery,
            "AddedNewParticipant"
        )
    })
    it("Should revert funding if funder did not grant token allowance to the lottery contract", async function () {
        const CSN_TO_FUND = 3000105
        const CONTRACTS_CSN_ALLOWANCE = 100
        await casinoToken.increaseAllowance(
            lottery.address,
            CONTRACTS_CSN_ALLOWANCE
        )
        await expect(lottery.fund(CSN_TO_FUND)).to.be.revertedWith(
            "ERC20: insufficient allowance"
        )
    })
    it("Should pick a random winner", async function () {
        console.log("Initial balances per address:")
        for (let i = 0; i < 6; i++) {
            const balance = await casinoToken.balanceOf(deployers[i].address)
            console.log(
                `Address ${deployers[i].address} has this much CSN: ${balance}`
            )
        }

        console.log("--------------------------------------------------")

        for (let i = 0; i < 6; i++) {
            const CSN_TO_FUND = 10000 + i * 10
            await casinoToken
                .connect(deployers[i])
                .increaseAllowance(lottery.address, CSN_TO_FUND)
            await lottery.connect(deployers[i]).fund(CSN_TO_FUND)
        }

        console.log("Balances per address after funding the lottery:")

        for (let i = 0; i < 6; i++) {
            let address = await deployers[i].getAddress()
            let balance = await casinoToken.balanceOf(address)
            console.log(`Address ${address} has this much CSN: ${balance}`)
        }

        console.log("--------------------------------------------------")

        console.log((await lottery.totalFunds()).toNumber())

        console.log(
            "Funds inside the lottery per address before the winner has been picked:"
        )

        for (let i = 0; i < 6; i++) {
            let balance = await lottery.fundsOf(deployers[i].address)
            console.log(
                `Address ${deployers[i].address} has ${balance} CNTs in the lottery pool`
            )
        }

        console.log("--------------------------------------------------")

        console.log("Triggering payout...")

        await new Promise<void>(async (resolve, reject) => {
            lottery.once("WinnerIndex", async () => {
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

        console.log("Balances per address after the winner has been picked:")

        for (let i = 0; i < 6; i++) {
            let address = await deployers[i].getAddress()
            let balance = await casinoToken.balanceOf(address)
            console.log(`Address ${address} has this much CSN: ${balance}`)
        }

        expect(1).to.equal(1)
    })
    it("Should revert the withdrawal of non-existent funds", async () => {
        console.log("--------------------------------------------------")

        console.log((await lottery.totalFunds()).toNumber())

        console.log(
            "Remaining funds inside the lottery per address after the winner has been picked:"
        )

        for (let i = 0; i < 6; i++) {
            let balance = await lottery.fundsOf(deployers[i].address)
            console.log(
                `Address ${deployers[i].address} has ${balance} CNTs in the lottery pool`
            )
        }
        const CSN_TO_WITHDRAW = 21
        await expect(
            lottery.connect(deployers[4]).withdraw(CSN_TO_WITHDRAW)
        ).to.be.revertedWith(
            "You do not have this amount of funds inside the lottery!"
        )
    })

    it("Should allow the withdrawal of existent funds", async () => {
        const initialBalance = (
            await casinoToken.balanceOf(deployers[4].address)
        ).toNumber()

        const CSN_TO_WITHDRAW = 20

        await lottery.connect(deployers[4]).withdraw(CSN_TO_WITHDRAW)

        console.log("--------------------------------------------------")

        console.log((await lottery.totalFunds()).toNumber())

        console.log(
            "Remaining funds inside the lottery per address after the withdrawal:"
        )

        for (let i = 0; i < 6; i++) {
            let balance = await lottery.fundsOf(deployers[i].address)
            console.log(
                `Address ${deployers[i].address} has ${balance} CNTs in the lottery pool`
            )
        }

        const afterWidthdrawalBalance = (
            await casinoToken.balanceOf(deployers[4].address)
        ).toNumber()

        console.log("--------------------------------------------------")

        for (let i = 0; i < 6; i++) {
            let address = await deployers[i].getAddress()
            let balance = await casinoToken.balanceOf(address)
            console.log(`Address ${address} has this much CSN: ${balance}`)
        }

        expect(initialBalance + CSN_TO_WITHDRAW).to.equal(
            afterWidthdrawalBalance
        )
    })
})
