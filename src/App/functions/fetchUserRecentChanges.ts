import { TokenIF } from '../../utils/interfaces/TokenIF';
import { ITransaction } from '../../utils/state/graphDataSlice';
import { getTransactionData } from './getTransactionData';

interface IFetchUserRecentChangesProps {
    importedTokens: TokenIF[];
    user: string;
    chainId: string;
    annotate: boolean;
    addValue: boolean;
    simpleCalc: boolean;
    annotateMEV: boolean;
    ensResolution: boolean;
    n?: number;
    page?: number;
}

export const fetchUserRecentChanges = (props: IFetchUserRecentChangesProps) => {
    const {
        importedTokens,
        user,
        chainId,
        annotate,
        addValue,
        simpleCalc,
        annotateMEV,
        ensResolution,
        n,
        // page,
    } = props;

    const userRecentChangesCacheEndpoint =
        'https://809821320828123.de:5000' + '/user_recent_changes?';

    console.log('fetching user recent changes');

    const poolChanges = fetch(
        userRecentChangesCacheEndpoint +
            new URLSearchParams({
                user: user,
                chainId: chainId,
                annotate: annotate.toString(),
                addValue: addValue.toString(),
                simpleCalc: simpleCalc.toString(),
                annotateMEV: annotateMEV.toString(),
                ensResolution: ensResolution.toString(),
                n: n ? n.toString() : '', // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                // page: page ? page.toString() : '', // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const userTransactions = json?.data;

            const updatedTransactions = Promise.all(
                userTransactions.map((tx: ITransaction) => {
                    return getTransactionData(tx, importedTokens);
                }),
            ).then((updatedTransactions) => {
                return updatedTransactions;
            });
            return updatedTransactions;
        })
        .catch(console.log);

    return poolChanges;
};
