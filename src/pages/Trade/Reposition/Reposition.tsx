// import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import RepositionButton from '../../../components/Trade/Reposition/Repositionbutton/RepositionButton';
import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import RepositionRangeWidth from '../../../components/Trade/Reposition/RepositionRangeWidth/RepositionRangeWidth';
import styles from './Reposition.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';

// import { useState, useEffect } from 'react';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';

interface propsIF {
    isDenomBase: boolean;
}

export default function Reposition(props: propsIF) {
    const { isDenomBase } = props;

    const { params } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    if (!location.state) {
        const redirectParams = params ?? '';
        navigate('/trade/range/' + redirectParams);
    }

    useEffect(() => console.log({location}), [location.pathname]);

    const { position } = location.state;

    const currentPoolPriceTick = position?.poolPriceInTicks || 0;
    const baseTokenDecimals = position?.baseDecimals || 18;
    const quoteTokenDecimals = position?.quoteDecimals || 18;

    const currentPoolPriceNonDisplay = tickToPrice(currentPoolPriceTick);

    const currentPoolDisplayPriceInBase =
        1 / toDisplayPrice(currentPoolPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const currentPoolDisplayPriceInQuote = toDisplayPrice(
        currentPoolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const truncatedCurrentPoolDisplayPriceInBase = currentPoolDisplayPriceInBase
        ? currentPoolDisplayPriceInBase < 2
            ? currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const truncatedCurrentPoolDisplayPriceInQuote = currentPoolDisplayPriceInQuote
        ? currentPoolDisplayPriceInQuote < 2
            ? currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '0'
            : isDenomBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    const currentLocation = location.pathname;
    const [
        isModalOpen,
        // openModal,
        closeModal,
    ] = useModal();

    const confirmRepositionModal = isModalOpen ? (
        <Modal onClose={closeModal} title=' Confirm Reposition'>
            <ConfirmRepositionModal onClose={closeModal} />
        </Modal>
    ) : null;

    const repositionAddToggle = (
        <div className={styles.reposition_toggle_container}>
            <Link
                to='/trade/reposition'
                className={
                    currentLocation.includes('reposition')
                        ? styles.active_button_toggle
                        : styles.non_active_button_toggle
                }
            >
                Reposition
            </Link>
            <Link
                to='/trade/add'
                className={
                    currentLocation.includes('add')
                        ? styles.active_button_toggle
                        : styles.non_active_button_toggle
                }
            >
                Add
            </Link>
        </div>
    );

    const sendRepositionTransaction = () => {
        console.log({ position });
    };

    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(10);

    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader />

            <div className={styles.reposition_content}>
                {repositionAddToggle}
                {/* <DividerDark /> */}
                <RepositionRangeWidth
                    rangeWidthPercentage={rangeWidthPercentage}
                    setRangeWidthPercentage={setRangeWidthPercentage}
                />
                <RepositionDenominationSwitch
                    baseTokenSymbol={position?.baseSymbol || 'ETH'}
                    quoteTokenSymbol={position?.quoteSymbol || 'USDC'}
                />
                <RepositionPriceInfo
                    position={position}
                    currentPoolPriceDisplay={currentPoolPriceDisplay}
                    currentPoolPriceTick={currentPoolPriceTick}
                    rangeWidthPercentage={rangeWidthPercentage}
                />
                <RepositionButton onClickFn={sendRepositionTransaction} />
                {/* <RepositionButton onClickFn={openModal} /> */}
            </div>
            {confirmRepositionModal}
        </div>
    );
}
