import { expect } from "chai"
import { ethers, network } from "hardhat"
import { CasinoToken, CasinoToken__factory } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("CasinoToken", function () {
    let casinoToken: CasinoToken
    let casinoTokenFactory: CasinoToken__factory
    let deployers: SignerWithAddress[]
    const CSN_INITIAL_SUPPLY = 4000000

    beforeEach(async () => {
        casinoTokenFactory = (await ethers.getContractFactory(
            "CasinoToken"
        )) as CasinoToken__factory
        casinoToken = await casinoTokenFactory.deploy({
            value: CSN_INITIAL_SUPPLY,
        })
        casinoToken = await ethers.getContract("CasinoToken")
        deployers = await ethers.getSigners()
    })
    it("Should have the total supply equal to the initial supply after the deployment", async function () {
        let totalSupply = await casinoToken.totalSupply()
        expect(CSN_INITIAL_SUPPLY * 100).to.equal(totalSupply)
    })
    it("Should have total supply expanded by the minted amount", async function () {
        const ETHER_SUPPLIED = ethers.utils.parseEther("2")
        const CSN_EXPECTED = ethers.utils.parseUnits("2000", 4)
        let initialSupply = (await casinoToken.totalSupply()).toNumber()
        await casinoToken.mint(deployers[1].address, CSN_EXPECTED, {
            value: ETHER_SUPPLIED.toString(),
        })
        let newSupply = (await casinoToken.totalSupply()).toNumber()
        expect(initialSupply + ETHER_SUPPLIED.toNumber() * 100).to.equal(
            newSupply
        )
    })
    it("Should reduce total supply by the amount burnt", async function () {
        const AMOUNT_TO_BURN = 1000000
        let initialSupply = (await casinoToken.totalSupply()).toNumber()
        await casinoToken.burn(AMOUNT_TO_BURN)
        let newSupply = (await casinoToken.totalSupply()).toNumber()
        expect(initialSupply - AMOUNT_TO_BURN).to.equal(newSupply)
    })
    it("Should revert if someone tries to burn more tokens that one has", async function () {
        const ETHER_SUPPLIED = ethers.utils.parseEther("0.0003")
        const CSN_EXPECTED = ethers.utils.parseUnits("3", 4)
        const TOKENS_BURNED = ethers.utils.parseUnits("3.1", 4)

        await casinoToken.mint(deployers[2].address, CSN_EXPECTED, {
            value: ETHER_SUPPLIED,
        })
        await expect(
            casinoToken.connect(deployers[2]).burn(TOKENS_BURNED)
        ).to.be.revertedWithCustomError(
            casinoToken,
            "CasinoToken__InsufficientTokens"
        )
    })
    it("Should revert if someone tries to transfer more token than one has", async function () {
        const ETHER_SUPPLIED = ethers.utils.parseEther("0.4")
        const CSN_EXPECTED = ethers.utils.parseUnits("400", 4)
        const TOKENS_TRANSFERRED = ethers.utils.parseUnits("401", 4)

        await casinoToken.mint(deployers[3].address, CSN_EXPECTED, {
            value: ETHER_SUPPLIED,
        })
        await expect(
            casinoToken
                .connect(deployers[3])
                .transfer(deployers[4].address, TOKENS_TRANSFERRED)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
    })
    it("Should transfer from to", async function () {
        const ETHER_SUPPLIED = ethers.utils.parseEther("0.5")
        const CSN_EXPECTED = ethers.utils.parseUnits("500", 4)
        const TOKENS_TRANSFERRED = ethers.utils.parseUnits("300", 4)

        await casinoToken.mint(deployers[4].address, CSN_EXPECTED, {
            value: ETHER_SUPPLIED,
        })

        await casinoToken
            .connect(deployers[4])
            .transfer(deployers[5].address, TOKENS_TRANSFERRED)

        expect(await casinoToken.balanceOf(deployers[5].address)).to.equal(
            TOKENS_TRANSFERRED
        )
    })
})
