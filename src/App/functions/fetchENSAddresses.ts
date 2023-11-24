import { fetchBatch } from '../../utils/functions/fetchBatch';

/* eslint-disable camelcase */
export async function fetchENSAddresses(address: string) {
    try {
        const body = { config_path: 'ens_address', address: address };
        const nonce = address.toLowerCase();
        const { ens_address } = await fetchBatch<'ens_address'>(body, nonce);
        return ens_address;
    } catch (error) {
        return null;
    }
}
