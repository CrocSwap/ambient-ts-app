import {
    encodeAbiParameters,
    keccak256,
    encodePacked,
    Address,
    toBytes,
    ByteArray,
} from 'viem';

/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
 * to uniquely identify LP positions.
 *
 * @param owner The owner of the ambient LP (usually msg.sender)
 * @param base The address of the base token in the pool
 * @param quote The address of the quote token in the pool
 * @param poolType The pool type index number
 * @return The EVM slot hash that the position is stored at in the contract.  */
export function ambientPosSlot(
    owner: string,
    base: string,
    quote: string,
    poolType: number,
): ByteArray {
    const poolHash = keccak256(
        encodeAbiParameters(
            [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
            [base as Address, quote as Address, BigInt(poolType)],
        ),
    );

    const posKey = keccak256(
        encodePacked(['address', 'bytes32'], [owner as Address, poolHash]),
    );
    return toBytes(
        keccak256(
            encodePacked(['bytes32', 'uint256'], [posKey, AMBIENT_POS_SLOT]),
        ),
    );
}

/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
 * to uniquely identify LP positions.
 *
 * @param owner The owner of the ambient LP (usually msg.sender)
 * @param base The address of the base token in the pool
 * @param quote The address of the quote token in the pool
 * @param poolType The pool type index number
 * @return The EVM slot hash that the position is stored at in the contract.  */
export function concPosSlot(
    owner: string,
    base: string,
    quote: string,
    lowerTick: number,
    upperTick: number,
    poolType: number,
): ByteArray {
    const poolHash = keccak256(
        encodeAbiParameters(
            [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
            [base as Address, quote as Address, BigInt(poolType)],
        ),
    );

    const posKey = keccak256(
        encodePacked(
            ['address', 'bytes32', 'int24', 'int24'],
            [owner as Address, poolHash, lowerTick, upperTick],
        ),
    );
    return toBytes(
        keccak256(
            encodePacked(['bytes32', 'uint256'], [posKey, CONC_POS_SLOT]),
        ),
    );
}

// Based on the slots of the current contract layout
const AMBIENT_POS_SLOT = BigInt(65550);
const CONC_POS_SLOT = BigInt(65549);
