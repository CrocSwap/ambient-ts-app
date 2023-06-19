import { contractAddrRegEx } from '../regex/exports';

// fn to validate a contract address (construction only)
export default function validateAddress(addr: string): boolean {
    return contractAddrRegEx.test(addr);
}
