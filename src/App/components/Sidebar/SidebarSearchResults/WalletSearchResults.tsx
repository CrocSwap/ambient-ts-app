import { TransactionServerIF } from '../../../../ambient-utils/types';
import { FlexContainer } from '../../../../styled/Common';

interface propsIF {
    searchedWallets: TransactionServerIF | null;
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
            {JSON.stringify(searchedWallets)}
        </FlexContainer>
    );
}
