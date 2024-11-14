import { VaultServerIF } from './vaultServerIF';

export interface VaultIF extends VaultServerIF {
    balance: string|undefined;
    balanceAmount: string|undefined;
    balanceUsd: string|undefined;
}
