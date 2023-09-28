import { useEffect, useState } from 'react';
import { FlexContainer, Text } from '../../../styled/Common';
import Modal from '../Modal/Modal';
import { useModal } from '../Modal/useModal';
import PositionResetCard from './PositionResetCard';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import Toggle from '../../Form/Toggle';

// interface PositionResetPropsIF {
//     isPositionResetModalOpen: boolean;
// }
export default function PositionReset() {
    const [isModalOpen, openModal, closeModal] = useModal();
    const [doNotShowPositionReset, setDoNotShowPositionReset] = useState(
        localStorage.getItem('doNotShowPositionReset') === 'true',
    );

    const graphData = useAppSelector((state) => state?.graphData);
    const userPositions = graphData?.positionsByUser?.positions?.slice(0, 3);

    const { address } = useAccount();

    useEffect(() => {
        if (address) openModal();
    }, [address]);

    useEffect(() => {
        if (doNotShowPositionReset) closeModal();
    }, []);

    const positionsDisplay = (
        <FlexContainer
            gap={10}
            flexDirection='column'
            style={{ maxHeight: '120px', overflowY: 'scroll' }}
        >
            {userPositions?.map((position, idx) => (
                <PositionResetCard
                    key={idx}
                    position={position}
                    isLoading={userPositions.length < 1}
                />
            ))}
        </FlexContainer>
    );

    useEffect(() => {
        localStorage.setItem(
            'doNotShowPositionReset',
            doNotShowPositionReset.toString(),
        );
    }, [doNotShowPositionReset]);

    const dismissToggle = (
        <FlexContainer
            justifyContent='space-between'
            alignItems='center'
            style={{ cursor: 'pointer', padding: '1rem' }}
        >
            <Text
                tabIndex={0}
                fontWeight='300'
                color='negative'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'center',
                }}
            >
                Do not show me this again.
            </Text>
            <Toggle
                isOn={doNotShowPositionReset}
                handleToggle={() => {
                    setDoNotShowPositionReset(!doNotShowPositionReset);
                }}
                id='do_not_show_positions_toggle'
                disabled={false}
            />
        </FlexContainer>
    );

    if (!isModalOpen) return null;
    return (
        <Modal onClose={closeModal} title='Reset Position'>
            <FlexContainer
                flexDirection='column'
                gap={8}
                padding='16px'
                style={{ width: '454px' }}
            >
                <FlexContainer flexDirection='column' gap={8}>
                    <Text
                        tabIndex={0}
                        fontWeight='300'
                        color='text2'
                        style={{
                            fontSize: 'var(--body-size)',
                            lineHeight: 'var(--body-lh)',
                        }}
                    >
                        We have identified a small number of positions that have
                        not been occuring rewards correctly. Below are the
                        affected positions that require resetting.
                    </Text>
                    <Text
                        tabIndex={0}
                        fontWeight='300'
                        color='text2'
                        style={{
                            fontSize: 'var(--body-size)',
                            lineHeight: 'var(--body-lh)',
                        }}
                    >
                        Simply click the reset button below on each to reset the
                        position and begin earning rewards correctly.
                    </Text>
                </FlexContainer>

                {positionsDisplay}

                <Text
                    tabIndex={0}
                    fontWeight='300'
                    color='text2'
                    style={{
                        fontSize: 'var(--body-size)',
                        lineHeight: 'var(--body-lh)',
                        textAlign: 'center',
                    }}
                >
                    We have deposited the correct amount of earned rewards in
                    your exchange balance for these positions.
                </Text>

                {dismissToggle}
            </FlexContainer>
        </Modal>
    );
}
