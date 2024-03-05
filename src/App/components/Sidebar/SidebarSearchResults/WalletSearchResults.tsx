import { trimString } from '../../../../ambient-utils/dataLayer';
import { FlexContainer, Text } from '../../../../styled/Common';
import { Results } from '../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { sidebarSearchIF } from '../../../hooks/useSidebarSearch';

interface propsIF {
    searchData: sidebarSearchIF;
}

export default function WalletSearchResults(props: propsIF) {
    const { searchData } = props;

    // hook to generate navigation actions with pre-loaded path to `/account`
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    // fn to navigate user on click and clear input
    function handleClick(addr: string): void {
        linkGenAccount.navigate(addr);
        searchData.clearInput();
    }

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                Wallets
            </Text>
            {searchData.wallets.map((wallet: string) => (
                <Results
                    key={wallet}
                    fullWidth
                    fontWeight='300'
                    fontSize='body'
                    color='text2'
                    padding='4px'
                    onClick={() => handleClick(wallet)}
                >
                    {trimString(wallet, 18, 16)}
                </Results>
            ))}
        </FlexContainer>
    );
}
