// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceTransfer {
    struct Transfer {
        string evidenceId;           // Changed from uint256 to string
        string caseId;
        address transferredBy;
        string transferredTo;        // Changed from address to string
        uint256 transferredAt;
        uint256 receivedAt;
        string status;
        string remarks;
    }

    // evidenceId => list of transfers
    mapping(string => Transfer[]) public evidenceTransfers; // Changed key to string

    event EvidenceTransferred(
        string evidenceId,           // Changed from uint256 to string
        string caseId,
        address indexed transferredBy,
        string transferredTo,        // Changed from address to string
        uint256 transferredAt,
        string status,
        string remarks
    );

    function recordTransfer(
        string memory evidenceId,    // Changed from uint256 to string
        string memory caseId,
        string memory transferredTo, // Changed from address to string
        string memory status,
        string memory remarks
    ) public {
        Transfer memory newTransfer = Transfer({
            evidenceId: evidenceId,
            caseId: caseId,
            transferredBy: msg.sender,
            transferredTo: transferredTo,
            transferredAt: block.timestamp,
            receivedAt: 0,
            status: status,
            remarks: remarks
        });

        evidenceTransfers[evidenceId].push(newTransfer);

        emit EvidenceTransferred(
            evidenceId,
            caseId,
            msg.sender,
            transferredTo,
            block.timestamp,
            status,
            remarks
        );
    }
}