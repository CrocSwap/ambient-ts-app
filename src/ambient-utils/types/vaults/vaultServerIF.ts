import { VaultIF } from './vaultIF';

export interface vaultServerIF {
    code: number;
    message: 'Successfully';
    data: {
        vaults: VaultIF[];
    };
    pagination: {
        totalItems: number;
    };
}
