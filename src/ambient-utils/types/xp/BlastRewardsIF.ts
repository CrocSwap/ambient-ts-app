export interface BlastRewardIF {
    amount: number;
    logo: React.ReactNode;
}

export interface BlastRewardsDataIF {
    [key: string]: BlastRewardIF;
}
