// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Imaging {
    struct ImagingEvidence {
        string fileName;
        string sha256Hash;
        bool imagingDone;
        bool downloaded;
        uint256 timestamp;
    }

    mapping(string => ImagingEvidence) public imagingEvidences; // key: sha256Hash

    event ImagingEvidenceAdded(string fileName, string sha256Hash);

    function addImagingEvidence(
        string memory fileName,
        string memory sha256Hash,
        bool imagingDone,
        bool downloaded
    ) public {
        imagingEvidences[sha256Hash] = ImagingEvidence(
            fileName,
            sha256Hash,
            imagingDone,
            downloaded,
            block.timestamp
        );
        emit ImagingEvidenceAdded(fileName, sha256Hash);
    }

    function getImagingEvidence(string memory sha256Hash) public view returns (ImagingEvidence memory) {
        return imagingEvidences[sha256Hash];
    }
}