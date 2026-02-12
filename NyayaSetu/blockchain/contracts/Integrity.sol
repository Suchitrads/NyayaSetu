// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Integrity {
    struct IntegrityRecord {
        string evidenceId;
        string sha256Hash;
        string status;
        uint256 timestamp;
    }

    mapping(string => IntegrityRecord) public integrityRecords; // key: evidenceId

    event IntegrityRecordAdded(string evidenceId, string sha256Hash);

    function addIntegrityRecord(
        string memory evidenceId,
        string memory sha256Hash,
        string memory status
    ) public {
        integrityRecords[evidenceId] = IntegrityRecord(
            evidenceId,
            sha256Hash,
            status,
            block.timestamp
        );
        emit IntegrityRecordAdded(evidenceId, sha256Hash);
    }

    function getIntegrityRecord(string memory evidenceId) public view returns (IntegrityRecord memory) {
        return integrityRecords[evidenceId];
    }
}