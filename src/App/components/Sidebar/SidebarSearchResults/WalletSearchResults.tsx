import { trimString } from '../../../../ambient-utils/dataLayer';
import { FlexContainer, Text } from '../../../../styled/Common';
import { Results } from '../../../../styled/Components/Sidebar';

interface propsIF {
    searchedWallets: string[];
}

export default function WalletSearchResults(props: propsIF) {
    const { searchedWallets } = props;
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
            {searchedWallets.map((wallet: string) => (
                <Results
                    key={wallet}
                    fullWidth
                    fontWeight='300'
                    fontSize='body'
                    color='text2'
                    padding='4px'
                    onClick={() => console.log(`clicked wallet ${wallet}`)}
                >
                    {trimString(wallet, 20, 18)}
                </Results>
            ))}
        </FlexContainer>
    );
}
