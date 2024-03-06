import { trimString } from '../../../../ambient-utils/dataLayer';
import { FlexContainer, Text } from '../../../../styled/Common';
import { Results } from '../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import {
    sidebarSearchIF,
    walletHexAndENS,
} from '../../../hooks/useSidebarSearch';

interface propsIF {
    searchData: sidebarSearchIF;
}

export default function WalletSearchResults(props: propsIF) {
    const { searchData } = props;

    // TODO:    this file will use the index page rather than the `/account` page to show
    // TODO:    ... account data for the user due bugs changing networks on that URL route,
    // TODO:    ... once that bug is fixed we should refactor to use the `/account` route

    // hook to generate navigation actions with pre-loaded path to `/account`
    const linkGenAccount: linkGenMethodsIF = useLinkGen('index');

    // fn to navigate user on click and clear input
    function handleClick(w: walletHexAndENS): void {
        const address: string = w.ens ?? w.hex;
        linkGenAccount.navigate(address);
        searchData.clearInput();
    }

    return (
        <FlexContainer
            as='ul'
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                Wallets
            </Text>
            {searchData.wallets.map((wallet: walletHexAndENS) => (
                <Results
                    as='li'
                    key={wallet.hex}
                    fullWidth
                    fontWeight='300'
                    fontSize='body'
                    color='text2'
                    padding='4px'
                    onClick={() => handleClick(wallet)}
                >
                    {wallet.ens && (
                        <div>ENS: {trimString(wallet.ens, 18, 16)}</div>
                    )}
                    <div>Hex: {trimString(wallet.hex, 15, 13)}</div>
                </Results>
            ))}
        </FlexContainer>
    );
}
