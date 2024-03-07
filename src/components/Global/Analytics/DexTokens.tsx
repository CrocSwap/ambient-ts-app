import { memo } from 'react';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import { SortedPoolMethodsIF, useSortedPools } from './useSortedPools';
import TableHead from './TableHead';
import Spinner from '../Spinner/Spinner';
import {
    ScrollableContainer,
    ShadowBox,
    SpinnerContainer,
    Table,
    TableBody,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import TokenRow from './TokenRow';
import { useSortedDexTokens } from './useSortedDexTokens';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
export interface HeaderItem {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    sortable: boolean;
    pxValue?: number;
    onClick?: () => void;
}

interface propsIF {
    dexTokens: dexTokenData[];
    allPools: Array<PoolDataIF>;
    chainId: string;
}

function DexTokens(props: propsIF) {
    const { dexTokens, allPools, chainId } = props;

    const sortedTokens = useSortedDexTokens(dexTokens);

    // logic to take raw pool list and sort them based on user input
    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);

    // !important:  any changes to `sortable` values must be accompanied by an update
    // !important:  ... to the type definition `sortType` in `useSortedPools.ts`
    const dexTokensHeaderItems: HeaderItem[] = [
        {
            label: 'Token',
            hidden: false,
            align: 'left',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'TVL',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: false,
        },
        {
            label: 'Fees',
            hidden: false,
            align: 'right',
            responsive: 'sm',
            sortable: true,
        },
        {
            label: 'Volume',
            hidden: false,
            align: 'right',
            responsive: 'lg',
            sortable: true,
        },
    ];

    return (
        <FlexContainer fullHeight fullWidth>
            <ScrollableContainer>
                <ShadowBox>
                    <Table>
                        <TableHead
                            headerItems={dexTokensHeaderItems}
                            sortedPools={sortedPools}
                        />
                        <TableBody>
                            {sortedTokens.data.length ? (
                                sortedTokens.data.map((token: dexTokenData) => (
                                    <TokenRow
                                        key={JSON.stringify(token)}
                                        token={token}
                                    />
                                ))
                            ) : (
                                <SpinnerContainer
                                    fullHeight
                                    fullWidth
                                    alignItems='center'
                                    justifyContent='center'
                                >
                                    <Spinner
                                        size={100}
                                        bg='var(--dark1)'
                                        centered
                                    />
                                </SpinnerContainer>
                            )}
                        </TableBody>
                    </Table>
                </ShadowBox>
            </ScrollableContainer>
        </FlexContainer>
    );
}

export default memo(DexTokens);
