import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("FreelanceEscrow — Disputes, Basis Point Allocation, and Refunds", function () {
  it("should split disputed milestone using integer basis points without rounding leakage", async function () {
    const [client, freelancer, arbitrator] = await ethers.getSigners();
    const oddAmount = 1000000000000000001n; // 1 wei above 1 ETH
    const currentTime = await time.latest();

    const Factory = await ethers.getContractFactory("FreelanceEscrow");
    const escrow = await Factory.deploy(
      client.address,
      freelancer.address,
      arbitrator.address,
      "Dispute Project",
      ["Disputed Phase"],
      [oddAmount],
      [currentTime + 5000]
    );

    await escrow.connect(client).fundAgreement({ value: oddAmount });
    await escrow.connect(freelancer).submitMilestone(0, "Work delivered");
    await escrow.connect(freelancer).raiseDispute(0);

    // Arbitrator allocates 33.33% (3333 bps)
    await escrow.connect(arbitrator).resolveDispute(0, 3333);

    const m = await escrow.getMilestone(0);
    const fShare = m.freelancerShare_;
    const cRefund = m.clientRefund_;

    // Invariant: sum of shares must equal exactly oddAmount (zero leakage)
    expect(fShare + cRefund).to.equal(oddAmount);
    expect(await escrow.withdrawable(freelancer.address)).to.equal(fShare);
    expect(await escrow.withdrawable(client.address)).to.equal(cRefund);

    // Resolved milestone cannot be disputed or approved again
    await expect(escrow.connect(client).approveMilestone(0)).to.be.revertedWith(
      "FreelanceEscrow: milestone not in Submitted state"
    );
    await expect(escrow.connect(freelancer).raiseDispute(0)).to.be.revertedWith(
      "FreelanceEscrow: can only dispute Submitted milestone"
    );
  });

  it("should refund unstarted milestone and prevent duplicate refunds", async function () {
    const [client, freelancer, arbitrator] = await ethers.getSigners();
    const amount = ethers.parseEther("0.5");
    const currentTime = await time.latest();

    const Factory = await ethers.getContractFactory("FreelanceEscrow");
    const escrow = await Factory.deploy(
      client.address,
      freelancer.address,
      arbitrator.address,
      "Refund Project",
      ["Phase 1"],
      [amount],
      [currentTime + 5000]
    );

    await escrow.connect(client).fundAgreement({ value: amount });

    // Client refunds unstarted milestone
    await expect(escrow.connect(client).refundMilestone(0))
      .to.emit(escrow, "MilestoneRefunded")
      .withArgs(0, amount, client.address, await time.latest());

    expect(await escrow.withdrawable(client.address)).to.equal(amount);

    // Cannot refund again
    await expect(escrow.connect(client).refundMilestone(0)).to.be.revertedWith(
      "FreelanceEscrow: can only refund Pending milestone"
    );
  });
});
