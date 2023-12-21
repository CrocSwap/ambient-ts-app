import { UserXpIF } from '.';

export interface XpLeaderboardIF {
    dataReceived: boolean;
    xpLeaderboardData: Array<UserXpIF>;
}
