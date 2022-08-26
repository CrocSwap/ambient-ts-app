import { AuthenticateOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth';
import { Moralis } from 'moralis';

export default async function authenticateMagic(
    email: string,
    authenticate: (
        options?: AuthenticateOptions | undefined,
    ) => Promise<Moralis.User<Moralis.Attributes> | undefined>,
    redirectModal: () => void,
) {
    redirectModal();
    await authenticate({
        provider: 'magicLink',
        email: email,
        apiKey: 'pk_live_E2BB731C9C90E127', // Enter API key from Magic Dashboard https://dashboard.magic.link/
        network: 'goerli',
    });
}
