//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "./CasinoToken.sol";

contract Lottery is VRFConsumerBaseV2 {

    CasinoToken private casinoToken;
    VRFCoordinatorV2Interface private vrfCoordinator;

    uint32 private immutable numWords = 1;
    uint16 private immutable requestConfirmations = 3;

    event PreviousWinner(address);
    event PreviousPayout(uint);
    event PreviousParticipation(uint);
    event DeployersRoyalty(uint);
    event AddedNewParticipant(address);

    address private deployer;
    address[] public participants;
    address public jobScheduler;

    uint public totalFunds;
    uint64 private subscrId;
    uint32 private callbackGasLimit;
    bytes32 private coordinatorGasLane;

    mapping(address => uint256) public fundsAccounting;

    constructor(address myAddress, address vrfCoordinatorV2, bytes32 gasLane, uint64 subId, uint32 cbGasLimit, address cron) VRFConsumerBaseV2(vrfCoordinatorV2) {
        casinoToken = CasinoToken(myAddress);
        deployer = msg.sender;
        vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        coordinatorGasLane = gasLane;
        subscrId = subId;
        callbackGasLimit = cbGasLimit;
        jobScheduler = cron;
    }

    modifier onlyAboveThreshold(uint256 amount) {
        require(amount>=5e4, "Insufficient funding");
        _;
    }

    function fund(uint256 amount) public onlyAboveThreshold(amount) {
        casinoToken.transferFrom(msg.sender, address(this), amount);

        totalFunds = totalFunds + amount;

        fundsAccounting[msg.sender] = fundsAccounting[msg.sender] + amount;

        if(!isRegistered(msg.sender)){
            participants.push(msg.sender);
            emit AddedNewParticipant(msg.sender);
        }
    }

    function isRegistered(address sender) public view returns(bool) {
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == sender) {
                return true;
            }
        }
        return false;
    }

    modifier hasAppropriateStake(uint256 amount) {
        require(fundsAccounting[msg.sender] >= amount, "You do not have this amount of funds staked!");
        _;
    }

    function withdraw(uint256 amount) public hasAppropriateStake(amount){
        uint currentStake = fundsAccounting[msg.sender];
        if(currentStake - amount >= 5){
            casinoToken.transfer(msg.sender, amount);
            fundsAccounting[msg.sender] = currentStake - amount;
            totalFunds -= amount;
        }else{
            casinoToken.transfer(msg.sender, currentStake);
            fundsAccounting[msg.sender] = 0;
            totalFunds -= currentStake;
            withdrawalCleanUp(msg.sender);
        }
    }

    function withdrawalCleanUp(address withdrawer) private {
        uint256 remainingParticipantsLength = participants.length;

        for(uint i=0; i < participants.length; i++){
            if(participants[i] == withdrawer){
                delete participants[i];
                remainingParticipantsLength--;
            }
        }

        address[] memory remainingParticipants = new address[](remainingParticipantsLength);
        uint remainingParticipantsIndex = 0;

        for(uint i=0; i < participants.length; i++){
            address participantsAddress = participants[i];
            if(participantsAddress != address(0)){
                remainingParticipants[remainingParticipantsIndex] = participantsAddress;
                remainingParticipantsIndex++;
            }
        }

        participants = remainingParticipants;
    }

    function fundsOf(address participant) public view returns(uint){
        return fundsAccounting[participant];
    }

    // Gets triggered by Chainlink Automation Job Scheduler
    function payOut() external {
        require(msg.sender == jobScheduler, "Only Chainlink Automation Job Scheduler can call this function!");
        vrfCoordinator.requestRandomWords(
            coordinatorGasLane,
            subscrId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    // Gets called by Chainlink VRF
    function fulfillRandomWords(uint256, /*requestId*/ uint256[] memory randomWords) internal override {
        require(msg.sender == address(vrfCoordinator), "Only VRF Coordinator can call this function!");

        uint indexOfWinner = randomWords[0] % participants.length;
        uint lowestStake = getLowestStake();

        settlePayments(indexOfWinner, lowestStake);
        payoutCleanUp(lowestStake);
    }

    function getLowestStake() private view returns(uint){
        uint lowestStake = totalFunds;
        for(uint i=0; i < participants.length; i++){
            address participantsAddress = participants[i];
            if (fundsAccounting[participantsAddress] < lowestStake) {
                lowestStake = fundsAccounting[participantsAddress];
            }
        }

        return lowestStake;
    }

    function settlePayments(uint winner, uint lowestStake) private {
        uint totalDeducted = lowestStake * participants.length;
        uint jackpot = totalDeducted / 10 * 9;
        uint deployersRoyalty = totalDeducted - jackpot;

        casinoToken.transfer(participants[winner], jackpot);
        casinoToken.transfer(deployer, deployersRoyalty);

        totalFunds = totalFunds - totalDeducted;
        emit PreviousWinner(participants[winner]);
        emit PreviousPayout(jackpot);
        emit PreviousParticipation(participants.length);
        emit DeployersRoyalty(deployersRoyalty);
    }

    function payoutCleanUp(uint lowestStake) private {
        uint256 remainingParticipantsLength = participants.length;


        for(uint i=0; i < participants.length; i++){
            address participantsAddress = participants[i];

            fundsAccounting[participantsAddress] = fundsAccounting[participantsAddress] - lowestStake;

            if(fundsAccounting[participantsAddress] < 5e4){
                casinoToken.transfer(participantsAddress, fundsAccounting[participantsAddress]);
                totalFunds -= fundsAccounting[participantsAddress];
                fundsAccounting[participantsAddress] = 0;
                delete participants[i];
                remainingParticipantsLength--;
            }
        }

        address[] memory remainingParticipants = new address[](remainingParticipantsLength);
        uint remainingParticipantsIndex = 0;

        for(uint i=0; i < participants.length; i++){
            address participantsAddress = participants[i];
            if(participantsAddress != address(0)){
                remainingParticipants[remainingParticipantsIndex] = participantsAddress;
                remainingParticipantsIndex++;
            }
        }

        participants = remainingParticipants;
    }
}
