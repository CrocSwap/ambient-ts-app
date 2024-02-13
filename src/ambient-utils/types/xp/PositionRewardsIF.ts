// TODO: complete this when the real API is ready
export interface PositionRewardsServerIF {
    [key: string]: `${number}`;
}

export interface PositionRewardsDataIF {
    __BASE__: string;
    __QUOTE__: string;

    BLAST: string;
    AMBI: string;
    [key: string]: string;
}
