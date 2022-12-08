// START: Import React and Dongles
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// START: Import Local Files
import styles from './TokenSelectContainer.module.css';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF, TokenListIF } from '../../../utils/interfaces/exports';
import TokenList from '../../Global/TokenList/TokenList';
import { useSearch } from './useSearch';
import { importToken } from './importToken';
import RecentToken from './RecentToken/RecentToken';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ZERO_ADDRESS } from '../../../constants';
// import CustomTokens from '../TokenList/CustomTokens';

interface TokenSelectContainerPropsIF {
    resetTokenQuantities?: () => void;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: Dispatch<SetStateAction<boolean>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        resetTokenQuantities,
        reverseTokens,
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        showManageTokenListContent,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const navigate = useNavigate();

    const recentTokensInRTK = useAppSelector((state) => state.userData).recentTokens;

    const undeletableTokens = useMemo(
        () =>
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .find((tokenList: TokenListIF) => tokenList.uri === '/ambient-token-list.json')
                .tokens.map((tkn: TokenIF) => tkn.address),
        [],
    );

    const [matchingImportedTokens, matchingSearchableTokens, setSearchInput] = useSearch(
        tokensBank,
        searchableTokens,
        chainId,
    );

    const importedTokensAddresses = tokensBank.map((token: TokenIF) => token.address);

    const location = useLocation();

    const locationSlug = useMemo<string>(() => {
        const { pathname } = location;
        let slug = '';
        if (pathname.startsWith('/trade/market')) {
            slug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            slug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            slug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            slug = '/swap';
        }
        return slug;
    }, [location]);

    const chooseToken = (tok: TokenIF) => {
        // function to generate the URL string and navigate to it
        const goToNewUrlParams = (
            pathSlug: string,
            chain: string,
            addrTokenA: string,
            addrTokenB: string,
        ) =>
            navigate(
                pathSlug + '/chain=' + chain + '&tokenA=' + addrTokenA + '&tokenB=' + addrTokenB,
            );

        // user is updating token A
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === tok.address) {
                reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                '0x5',
                tok.address,
                tokenPair.dataTokenB.address === tok.address
                    ? tokenPair.dataTokenA.address
                    : tokenPair.dataTokenB.address,
            );
            // user is updating token B
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === tok.address) {
                reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                '0x5',
                tokenPair.dataTokenA.address === tok.address
                    ? tokenPair.dataTokenB.address
                    : tokenPair.dataTokenA.address,
                tok.address,
            );
        } else {
            console.warn(
                'Error in TokenSelectContainer.tsx, failed to find proper dispatch function.',
            );
        }

        resetTokenQuantities ? resetTokenQuantities() : null;
        closeModal();
    };

    const tokenListContent = (
        <>
            {/* <div className={styles.title}>YOUR TOKENS</div> */}

            <div className={styles.tokens_container}>
                {matchingImportedTokens.map((token: TokenIF, idx: number) => (
                    <TokenSelect
                        key={idx}
                        token={token}
                        chooseToken={chooseToken}
                        tokensBank={tokensBank}
                        undeletableTokens={undeletableTokens}
                        chainId={chainId}
                        setImportedTokens={setImportedTokens}
                        fromListsText='Vegan Bacon'
                    />
                ))}
            </div>
            {matchingSearchableTokens.length ? (
                <h3 className={styles.search_tokens_title}>SEARCHED TOKENS</h3>
            ) : null}
            <div className={styles.token_select_searchable_container}>
                {matchingSearchableTokens
                    .filter((token: TokenIF) => !importedTokensAddresses.includes(token.address))
                    .map((tkn: TokenIF, idx: number) => (
                        <TokenSelectSearchable
                            key={`tss_${idx}`}
                            token={tkn}
                            clickHandler={() =>
                                importToken(tkn, tokensBank, setImportedTokens, () =>
                                    chooseToken(tkn),
                                )
                            }
                        />
                    ))}
            </div>
        </>
    );

    const recentTokens = (
        <div className={styles.recent_tokens_container}>
            {recentTokensInRTK
                ?.filter((token) => token.address !== ZERO_ADDRESS)
                ?.slice(0, 4)
                .map((token, idx) => (
                    <RecentToken
                        key={idx}
                        token={token}
                        clickHandler={() => {
                            chooseToken(token);
                            // importToken(token, tokensBank, setImportedTokens, () => chooseToken(token));
                        }}
                    />
                ))}
        </div>
    );

    // const favoritesTab = <div style={{ minHeight: '300px' }}>Favorites</div>;
    // const importedTabs = (
    //     <div style={{ minHeight: '300px' }}>
    //         <CustomTokens
    //             chainId={chainId}
    //             tokenToUpdate={tokenToUpdate}
    //             undeletableTokens={undeletableTokens}
    //             justTokensDisplay={true}
    //             closeModal={closeModal}
    //         />
    //     </div>
    // );

    // const allTokenTabData = [
    //     { icon: '', label: 'All', content: tokenListContent },
    //     { icon: '', label: 'Favorites', content: favoritesTab },
    //     { icon: '', label: 'Imported', content: importedTabs },
    // ];
    // const [selectedTokenTab, setSelectedTokenTab] = useState(allTokenTabData[0]);

    // const tabControl = (
    //     <nav className={styles.tab_control_nav}>
    //         <ul>
    //             {allTokenTabData.map((item) => (
    //                 <li
    //                     key={item.label}
    //                     className={
    //                         item.label === selectedTokenTab.label
    //                             ? styles.selected
    //                             : styles.list_item
    //                     }
    //                     onClick={() => setSelectedTokenTab(item)}
    //                 >
    //                     {`${item.icon} ${item.label}`}
    //                     {item.label === selectedTokenTab.label ? (
    //                         <motion.div className={styles.underline} layoutId='underline' />
    //                     ) : null}
    //                 </li>
    //             ))}
    //         </ul>
    //     </nav>
    // );

    const tokenListContainer = (
        <>
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='Search by name, symbol, or paste address'
                    onChange={(event) => setSearchInput(event.target.value)}
                />
            </div>
            {/* {tabControl}
        
        
    {selectedTokenTab?.content} */}
            {recentTokens}

            {tokenListContent}
        </>
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? (
                <TokenList
                    chainId={chainId}
                    activeTokenListsChanged={activeTokenListsChanged}
                    indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                    tokenToUpdate={tokenToUpdate}
                    undeletableTokens={undeletableTokens}
                    closeModal={closeModal}
                />
            ) : (
                tokenListContainer
            )}
        </div>
    );
}
