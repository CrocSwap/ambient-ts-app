import { vaultIF } from './vaultIF';

export interface vaultServerIF {
    code: number;
    message: 'Successfully';
    data: {
        vaults: vaultIF[];
    };
    pagination: {
        totalItems: number;
    };
};