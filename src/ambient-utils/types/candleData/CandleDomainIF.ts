export interface CandleDomainIF {
    lastCandleDate: number | undefined;
    domainBoundry: number | undefined;
    isAbortedRequest: boolean;
    isResetRequest: boolean;
    isCondensedFetching: boolean;
}
