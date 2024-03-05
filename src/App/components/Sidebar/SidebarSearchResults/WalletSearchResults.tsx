import { FlexContainer } from '../../../../styled/Common';
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
            {searchedWallets.map((wallet: string) => (
                <Results
                    key={wallet}
                    numCols={1}
                    fullWidth
                    fontWeight='300'
                    fontSize='body'
                    color='text2'
                    padding='4px'
                    onClick={() => console.log(`clicked wallet ${wallet}`)}
                >
                    {wallet}
                </Results>
            ))}
        </FlexContainer>
    );
}
