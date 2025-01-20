import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { IS_LOCAL_ENV } from '../../../ambient-utils/constants';
import { maxWidth } from '../../../ambient-utils/types/mediaQueries';
import Button from '../../../components/Form/Button';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { FlexContainer, Text } from '../../../styled/Common';
import { AccordionHeader, ArrowIcon } from '../../../styled/Components/Sidebar';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
import { sidebarMethodsIF } from '../../hooks/useSidebar';

// interface for React functional component props
interface propsIF {
    name: string;
    icon: JSX.Element;
    data: JSX.Element;
    children?: ReactNode;
    shouldDisplayContentWhenUserNotLoggedIn: boolean;
    isDefaultOverridden: boolean;
    openAllDefault?: boolean;
    sidebar: sidebarMethodsIF;
}

export default function SidebarAccordion(props: propsIF) {
    const {
        name,
        icon,
        data,
        shouldDisplayContentWhenUserNotLoggedIn,
        isDefaultOverridden,
        sidebar,
    } = props;

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);
    const { isUserConnected } = useContext(UserDataContext);
    const isTopPools = name === 'Top Pools';

    const [isOpen, setIsOpen] = useState(isTopPools);

    useEffect(() => {
        if (isTopPools) {
            IS_LOCAL_ENV && console.debug({ isOpen });
        }
    }, [isTopPools, isOpen]);

    const BREAKPOINT: maxWidth = '(max-width: 1280px)';
    const overflowSidebarMQ = useMediaQuery(BREAKPOINT);

    const openStateContent = (
        <motion.div
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 1] }}
            style={{ overflow: 'hidden' }}
            onClick={overflowSidebarMQ ? () => sidebar.close() : undefined}
        >
            {data}
        </motion.div>
    );

    function handleAccordionClick() {
        if (sidebar.isOpen) {
            setIsOpen(!isOpen);
        } else {
            setIsOpen(true);
            sidebar.open();
        }
        IS_LOCAL_ENV && console.debug('clicked');
    }

    useEffect(() => {
        if (isDefaultOverridden) {
            if (props.openAllDefault) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    }, [props.openAllDefault, isDefaultOverridden]);

    const accordionContentToShow =
        !isUserConnected &&
        !shouldDisplayContentWhenUserNotLoggedIn &&
        sidebar.isOpen ? (
            <motion.div
                key='content'
                initial='collapsed'
                animate='open'
                exit='collapsed'
                variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 1] }}
                style={{ overflow: 'hidden' }}
            >
                <FlexContainer
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='body'
                    gap={8}
                    padding='8px'
                    color='text2'
                >
                    <p>Your recent {name.toLowerCase()} will display here.</p>
                    <Button
                        idForDOM={`connect_wallet_button_in_sidebar_${name}`}
                        action={openWalletModal}
                        flat
                        thin
                        title='Connect Wallet'
                    />
                </FlexContainer>
            </motion.div>
        ) : (
            sidebar.isOpen && openStateContent
        );

    // TODO: remove unnecessary wrapper inside `<AccordionHeader />`

    return (
        <FlexContainer
            flexDirection='column'
            style={{ flexShrink: '1', overflow: 'hidden' }}
        >
            <AccordionHeader
                onClick={() => handleAccordionClick()}
                open={sidebar.isOpen}
            >
                <FlexContainer
                    id={`sidebar_header_${name
                        .replaceAll(' ', '_')
                        .toLowerCase()}`}
                    flexDirection='row'
                    alignItems='center'
                    justifyContent={!sidebar.isOpen ? 'center' : 'flex-start'}
                    gap={8}
                >
                    {sidebar.isOpen && <ArrowIcon size={12} open={isOpen} />}
                    {icon}
                    {sidebar.isOpen && (
                        <Text fontSize='body' fontWeight='500'>
                            {name}
                        </Text>
                    )}
                </FlexContainer>
            </AccordionHeader>
            <AnimatePresence>
                {isOpen && accordionContentToShow}
            </AnimatePresence>
        </FlexContainer>
    );
}
