import { useMemo } from 'react';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiSettings5Line } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { SlippagePairIF } from '../../../../utils/interfaces/exports';
import { VscClose } from 'react-icons/vsc';

interface propsIF {
    positionHash: string;
    repoSlippage: SlippagePairIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function RepositionHeader(props: propsIF) {
    const {
        positionHash,
        repoSlippage,
        isPairStable,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const { params } = useParams();

    // generate a nav path for clicking the exit button
    // regenerate value every time the URL params change (virtually never)
    const exitPath = useMemo<string>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // break URL param string into parameter tuples
        const paramSets = fixedParams
            // split the params string at the separator character
            .split('&')
            // remove any values missing an = symbol
            .filter((par) => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map((par) => par.split('='))
            // remove empty strings created by extra = symbols
            .map((par) => par.filter((e) => e !== ''))
            // remove tuples with trisomy issues
            .filter((par) => par.length === 2);
        // fn to look up the value of any param
        // return empty string if param is not found
        const findParam = (name: string): string => {
            // find param tuple with name provided as an arg
            const paramTuple = paramSets.find((param) => param[0] === name);
            // return value from tuple or empty string in tuple is not found
            return paramTuple ? paramTuple[1] : '';
        };
        // generate and return nav path
        return (
            '/trade/range/chain=' +
            findParam('chain') +
            '&tokenA=' +
            findParam('tokenA') +
            '&tokenB=' +
            findParam('tokenB')
        );
    }, [params]);

    const navigate = useNavigate();

    const [isModalOpen, openModal, closeModal] = useModal();

    return (
        <ContentHeader>
            <div onClick={() => openModal()} style={{ cursor: 'pointer', marginLeft: '10px' }}>
                <RiSettings5Line />
            </div>
            <div className={styles.title}>Reposition: {trimString(positionHash, 4, 4, '…')}</div>

            {isModalOpen && (
                <Modal noHeader title='modal' onClose={closeModal}>
                    <TransactionSettings
                        module='Reposition'
                        toggleFor='repo'
                        slippage={repoSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm}
                        toggleBypassConfirm={toggleBypassConfirm}
                    />
                </Modal>
            )}
            <div
                onClick={() => navigate(exitPath, { replace: true })}
                style={{ cursor: 'pointer', marginRight: '10px' }}
            >
                <VscClose size={22} />
            </div>
        </ContentHeader>
    );
}
