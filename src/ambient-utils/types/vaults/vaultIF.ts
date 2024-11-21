import { AllVaultsServerIF } from './allVaultsServerIF';

export interface VaultIF extends AllVaultsServerIF {
    balance: string | undefined;
    balanceAmount: string | undefined;
    balanceUsd: string | undefined;
}
