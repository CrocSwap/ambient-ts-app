// TODO: complete this when the real API is ready
export interface PositionRewardsServerIF {
    [key: string]: `${number}`;
}

export interface PositionRewardsDataIF {
    // __BASE__: string;
    // __QUOTE__: string;

    'BLAST points': string;
    'BLAST gold': string;
    // 'AMBI points': string;
    [key: string]: string;
}
