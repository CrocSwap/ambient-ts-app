import { useEffect, useState } from 'react';
import styles from './Tokens.module.css';
import TokensHeader from './TokensHeader/TokensHeader';
import TokenCard from '../Tokens/TokenCard/TokenCard';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import Pagination from '../../Global/Pagination/Pagination';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useSearch } from '../../../utils/hooks/useSearch';
import searchNotFound from '../../../assets/animations/searchNotFound.json';
import Animation from '../../Global/Animation/Animation';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    open: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

interface propsIF {
    chainId: string;
}

export default function Tokens(props: propsIF) {
    const { chainId } = props;

    // THE FOLLOWING CODE HAS BEEN MOVED TO PORTFOLIOTABS SO THE DROPDOWN CAN BE USED ON THE RIGHT SIDE OF THE TAB HEADER AS PROPS

    const [tokenLists, setTokenLists] = useState<TokenListIF[]>();
    const [importedTokens, setImportedTokens] = useState<TokenIF[] | null>(null);
    importedTokens ?? setImportedTokens(JSON.parse(localStorage.getItem('user') as string).tokens);

    const [tokenSource, setTokenSource] = useState('imported');
    const [tokensInDOM, setTokensInDOM] = useState<TokenIF[]>([]);

    useEffect(() => {
        if (tokenSource === 'imported') {
            const tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
            setTokensInDOM(tokens);
        } else {
            setTokensInDOM(
                tokenLists?.find((list) => list.name === tokenSource)?.tokens as TokenIF[],
            );
        }
    }, [tokenSource]);

    useEffect(() => {
        setTokenLists(JSON.parse(localStorage.getItem('allTokenLists') as string));
    }, []);

    // pagination

    const largeScreen = useMediaQuery('(min-width: 1680px)');

    const [currentPage, setCurrentPage] = useState(1);
    const [tokensPerPage] = useState(largeScreen ? 9 : 7);

    useEffect(() => {
        setCurrentPage(1);
    }, []);

    // Get current transactions
    const indexOfLastTokens = currentPage * tokensPerPage;
    const indexOfFirstTokens = indexOfLastTokens - tokensPerPage;
    const currentTokens = tokensInDOM?.slice(indexOfFirstTokens, indexOfLastTokens);

    // Change page
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // end of pagination

    const { searchTerm, onSearchChange, filteredData } = useSearch<TokenIF>('symbol', tokensInDOM);

    const filteredDataOrNull = filteredData.length ? (
        filteredData.map((tkn, idx) => (
            <TokenCard key={JSON.stringify(tkn) + idx} token={tkn} chainId={chainId} />
        ))
    ) : (
        <div className={styles.none_found}>
            <Animation animData={searchNotFound} loop={true} />

            <h1>{`${searchTerm} not found`}</h1>
        </div>
    );

    const currentTokensOrNull = currentTokens.map((tkn, idx) => (
        <TokenCard key={JSON.stringify(tkn) + idx} token={tkn} chainId={chainId} />
    ));

    // dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDropdownClick = (value: string) => {
        setTokenSource(value);
        setIsDropdownOpen(!isDropdownOpen);
    };

    const dropdown = (
        <motion.nav
            initial={false}
            animate={isDropdownOpen ? 'open' : 'closed'}
            className={styles.menu}
        >
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {tokenSource === 'imported' ? 'My Tokens' : tokenSource}
                <motion.div
                    className={styles.menu_content}
                    variants={{
                        open: { rotate: 180 },
                        closed: { rotate: 0 },
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ originY: 0.55 }}
                >
                    <svg width='15' height='15' viewBox='0 0 20 20'>
                        <path d='M0 7 L 20 7 L 10 16' />
                    </svg>
                </motion.div>
            </motion.button>
            <motion.ul
                variants={{
                    open: {
                        clipPath: 'inset(0% 0% 0% 0% round 10px)',
                        transition: {
                            type: 'spring',
                            bounce: 0,
                            duration: 0.7,
                            delayChildren: 0.3,
                            staggerChildren: 0.05,
                        },
                    },
                    closed: {
                        clipPath: 'inset(10% 50% 90% 50% round 10px)',
                        transition: {
                            type: 'spring',
                            bounce: 0,
                            duration: 0.3,
                        },
                    },
                }}
                style={{ pointerEvents: isDropdownOpen ? 'auto' : 'none' }}
            >
                {tokenLists?.map((list, idx) => (
                    <motion.li
                        onClick={() => handleDropdownClick(list.name)}
                        value={list.name}
                        variants={itemVariants}
                        key={idx}
                    >
                        {list.name}{' '}
                    </motion.li>
                ))}
            </motion.ul>
        </motion.nav>
    );

    // end of dropdown ---

    return (
        <div className={styles.container} style={{ height: 'calc(100vh - 19.5rem' }}>
            <TokensHeader />
            <div className={styles.search_input_container}>
                <input
                    className={styles.search_input}
                    placeholder='Search tokens'
                    type='text'
                    value={searchTerm}
                    onChange={onSearchChange}
                />
                {dropdown}
            </div>
            <ol
                className={styles.item_container}
                style={{ minHeight: largeScreen ? '450px' : '350px' }}
            >
                {searchTerm === '' ? currentTokensOrNull : filteredDataOrNull}
            </ol>
            {searchTerm === '' && (
                <Pagination
                    itemsPerPage={tokensPerPage}
                    totalItems={tokensInDOM.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
}
