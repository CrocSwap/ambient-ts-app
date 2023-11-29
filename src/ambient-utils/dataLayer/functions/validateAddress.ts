import { contractAddrRegEx } from './regex';

// fn to validate a contract address (construction only)
export function validateAddress(addr: string): boolean {
    return contractAddrRegEx.test(addr);
}
