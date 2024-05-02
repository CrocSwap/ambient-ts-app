import React, {
    ChangeEvent,
    KeyboardEvent,
    useContext,
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
import { FaChevronDown } from 'react-icons/fa';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { AiOutlineFire } from 'react-icons/ai';

interface optionItem {
    id: number;
    name: string;
    data: JSX.Element;
}

const DropdownSearch = () => {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } =
        useContext(CachedDataContext);
    const [isOpen, setIsOpen] = useState(false);
    const { chainData: chainData } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const searchDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => setIsOpen(false);
    useOnClickOutside(searchDropdownItemRef, clickOutsideWalletHandler);

    const searchInputElementId = 'sidebar_search_input';
    const focusInput = (): void => {
        const inputField = document.getElementById(
            'sidebar_search_input',
        ) as HTMLInputElement;

        inputField.focus();
    };

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
            name: 'Trending',
            data: (
                <TopPools
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                />
            ),
        },
        {
            id: 2,
            name: 'Favorites',
            data: (
                <FavoritePools
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                />
            ),
        },
        {
            id: 3,
            name: 'Recent Pairs',
            data: (
                <RecentPools
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                />
            ),
        },
    ];

    const [activeOption, setActiveOption] = useState<optionItem>(
        optionButtons[0],
    );

    const handleClick = (option: optionItem) => {
        setActiveOption(option);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const optionButtonsDisplay = (
        <FlexContainer flexDirection='row' gap={8} justifyContent='flex-start'>
            {optionButtons.map((option) => (
                <motion.button
                    whileHover={{
                        scale: 1.2,
                        transition: { duration: 1 },
                    }}
                    whileTap={{ scale: 0.9 }}
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

    return (
        <AnimatePresence>
            <div className={styles.main_container} ref={searchDropdownItemRef}>
                <span
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    className={styles.arrow_icon}
                    onClick={toggleDropdown}
                >
                    <FaChevronDown />
                </span>

                {isOpen && (
                    <div className={styles.dropdown_container}>
                        {searchContainer}
                        {optionButtonsDisplay}

                        <motion.div
                            className={styles.dropdown_content}
                            initial={{ height: 0 }}
                            animate={{ height: '164px' }}
                            exit={{ height: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            {searchData.isInputValid ? (
                                <SidebarSearchResults
                                    searchData={searchData}
                                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                                    cachedFetchTokenPrice={
                                        cachedFetchTokenPrice
                                    }
                                />
                            ) : (
                                activeOption?.data
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </AnimatePresence>
    );
};
export default DropdownSearch;
