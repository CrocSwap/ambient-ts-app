export interface vaultsServerIF {
    code: number;
    message: 'Successfully';
    data: {
        vaults: {
            id: string;
            createdAt: number;
            updatedAt: number;
            createdBy: string;
            updatedBy: string;
            chainId: number;
            address: `0x${string}`;
            strategy: string;
            token0Address: `0x${string}`;
            token1Address: `0x${string}`;
            token0Decimals: number;
            token1Decimals: number;
            mainAsset: `0x${string}`;
            initTime: number;
            poolFee: string;
            koSize: number;
            tvlUsd: string;
            tvlMainAsset: string;
            apr: string;
        }[];
    };
    pagination: {
        totalItems: number;
    };
}