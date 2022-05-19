import Moralis from 'moralis/types';

export default async function getContractEthDiff(Moralis: Moralis, txHash: string) {
    const params = { txHash: txHash };
    const contractEthDiff = await Moralis.Cloud.run('getContractEthDiff', params);
    return contractEthDiff;
}
