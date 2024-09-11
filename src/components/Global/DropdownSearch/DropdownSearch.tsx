import React, {
    ChangeEvent,
    KeyboardEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import styles from './DropdownSearch.module.css';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import TopPools from '../Sidebar/TopPools';
import FavoritePools from '../Sidebar/FavoritePools';
import RecentPools from '../Sidebar/RecentPools';
import { FlexContainer } from '../../../styled/Common';
import {
    SearchContainer,
    SearchInput,
} from '../../../styled/Components/Sidebar';
import { BiSearch } from 'react-icons/bi';
import {
    sidebarSearchIF,
    useSidebarSearch,
} from '../../../App/hooks/useSidebarSearch';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { MdClose } from 'react-icons/md';
import SidebarSearchResults from '../../../App/components/Sidebar/SidebarSearchResults/SidebarSearchResults';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { AiOutlineFire } from 'react-icons/ai';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { TokenIF } from '../../../ambient-utils/types';
import { useMediaQuery } from '@material-ui/core';
import { HeaderButtons, HeaderText } from '../../../styled/Components/Chart';
import TokenIcon from '../TokenIcon/TokenIcon';
import { SidebarContext } from '../../../contexts/SidebarContext';
import useKeyPress from '../../../App/hooks/useKeyPress';

interface optionItem {
    id: number;
    name: string;
    data: JSX.Element;
}

const DropdownSearch = () => {
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { chainData: chainData } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const denomInBase = isDenomBase;

    const [topToken, bottomToken]: [TokenIF, TokenIF] = denomInBase
        ? [baseToken, quoteToken]
        : [quoteToken, baseToken];
    const smallScrenView = useMediaQuery('(max-width: 968px)');

    const searchDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => setIsPoolDropdownOpen(false);
    useOnClickOutside(searchDropdownItemRef, clickOutsideHandler);

    const searchInputElementId = 'sidebar_search_input';
    const focusInput = (): void => {
        const inputField = document.getElementById(
            'sidebar_search_input',
        ) as HTMLInputElement;

        inputField.focus();
    };

    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            setIsPoolDropdownOpen(false);
            searchData.clearInput();
        }
    }, [isEscapePressed]);

    const { positionsByUser, limitOrdersByUser, transactionsByUser } =
        useContext(GraphDataContext);

    // TODO: can pull into GraphDataContext
    const filterFn = <T extends { chainId: string }>(x: T) =>
        x.chainId === chainData.chainId;

    const _positionsByUser = positionsByUser.positions.filter(filterFn);
    const _txsByUser = transactionsByUser.changes.filter(filterFn);
    const _limitsByUser = limitOrdersByUser.limitOrders.filter(filterFn);

    const searchData: sidebarSearchIF = useSidebarSearch(
        _positionsByUser,
        _txsByUser,
        _limitsByUser,
        tokens,
    );

    const searchContainer: JSX.Element = (
        <SearchContainer
            flexDirection='row'
            alignItems='center'
            justifyContent='center'
            gap={4}
            padding='2px 8px'
        >
            <FlexContainer
                alignItems='center'
                justifyContent='center'
                padding='2px 0 0 0'
            >
                <BiSearch
                    size={18}
                    color={'var(--text2)'}
                    onClick={focusInput}
                />
            </FlexContainer>
            <SearchInput
                type='text'
                id={searchInputElementId}
                value={searchData.rawInput}
                placeholder='Search...'
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    searchData.setInput(e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.code === 'Escape') {
                        // prevent keypress from de-focusing the input
                        e.stopPropagation();
                        // clear search input, DOM will update
                        searchData.clearInput();
                        // unfocus the input
                        e.currentTarget.blur();
                    }
                }}
                spellCheck='false'
                autoComplete='off'
                tabIndex={1}
            />
            {searchData.isInputValid && (
                <FlexContainer
                    onClick={() => {
                        // clear search input, DOM will update
                        searchData.clearInput();
                        // manually focus DOM on the search input
                        const searchInput =
                            document.getElementById(searchInputElementId);
                        searchInput && searchInput.focus();
                    }}
                    role='button'
                    tabIndex={0}
                >
                    <MdClose size={18} color='#ebebeb66' />{' '}
                </FlexContainer>
            )}
        </SearchContainer>
    );

    const optionButtons = [
        {
            id: 1,
            name: 'Top Pools',
            data: <TopPools cachedQuerySpotPrice={cachedQuerySpotPrice} />,
        },
        {
            id: 2,
            name: 'Favorites',
            data: <FavoritePools cachedQuerySpotPrice={cachedQuerySpotPrice} />,
        },
        {
            id: 3,
            name: 'Recent Pairs',
            data: <RecentPools cachedQuerySpotPrice={cachedQuerySpotPrice} />,
        },
    ];

    const [activeOption, setActiveOption] = useState<optionItem>(
        optionButtons[0],
    );

    const handleClick = (option: optionItem) => {
        setActiveOption(option);
    };

    const optionButtonsDisplay = (
        <FlexContainer flexDirection='row' gap={8} justifyContent='flex-start'>
            {optionButtons.map((option) => (
                <motion.button
                    key={option.id}
                    onClick={() => handleClick(option)}
                    className={`${styles.option_button} ${
                        activeOption.name === option.name
                            ? styles.active_option
                            : null
                    }`}
                >
                    {option.name === 'Trending' ? (
                        <FlexContainer gap={4} alignItems='center'>
                            <AiOutlineFire />
                            {option.name}
                        </FlexContainer>
                    ) : (
                        option.name
                    )}
                </motion.button>
            ))}
        </FlexContainer>
    );

    const toggleDropdown = () => {
        setIsPoolDropdownOpen(!isPoolDropdownOpen);
    };

    const dropdownSearchContent = (
        <AnimatePresence>
            <div className={styles.dropdown_container}>
                {searchContainer}
                {searchData.isInputValid || optionButtonsDisplay}

                <motion.div
                    className={styles.dropdown_content}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    {searchData.isInputValid ? (
                        <SidebarSearchResults searchData={searchData} />
                    ) : (
                        activeOption?.data
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return (
        <FlexContainer
            gap={8}
            className={styles.main_container}
            ref={searchDropdownItemRef}
        >
            <HeaderButtons
                id='token_pair_in_chart_header'
                aria-label='toggle dropdown.'
                onClick={toggleDropdown}
                style={{ justifyContent: 'flex-start' }}
            >
                <FlexContainer
                    id='trade_chart_header_token_pair_logos'
                    role='button'
                    gap={8}
                >
                    <TokenIcon
                        token={topToken}
                        src={topToken.logoURI}
                        alt={topToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                    <TokenIcon
                        token={bottomToken}
                        src={bottomToken.logoURI}
                        alt={bottomToken.symbol}
                        size={smallScrenView ? 's' : 'l'}
                    />
                </FlexContainer>
                <HeaderText
                    id='trade_chart_header_token_pair_symbols'
                    fontSize='header1'
                    fontWeight='300'
                    color='text1'
                    role='button'
                    aria-live='polite'
                    aria-atomic='true'
                    aria-relevant='all'
                    style={{ minWidth: '160px' }}
                >
                    {topToken.symbol} / {bottomToken.symbol}
                </HeaderText>
                <span className={styles.arrow_icon}>
                    {isPoolDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
            </HeaderButtons>
            {isPoolDropdownOpen && dropdownSearchContent}
        </FlexContainer>
    );
};
export default DropdownSearch;
