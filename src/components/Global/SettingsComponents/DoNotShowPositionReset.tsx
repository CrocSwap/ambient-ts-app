import { useEffect, useState } from 'react';
import { FlexContainer, Text } from '../../../styled/Common';
import Toggle from '../../Form/Toggle';

export default function DoNotShowPositionReset() {
    const isOnSettingsPage = location.pathname.startsWith('/settings');

    const [doNotShowPositionReset, setDoNotShowPositionReset] = useState(
        localStorage.getItem('doNotShowPositionReset') === 'true',
    );

    useEffect(() => {
        localStorage.setItem(
            'doNotShowPositionReset',
            doNotShowPositionReset.toString(),
        );
    }, [doNotShowPositionReset]);

    return (
        <FlexContainer
            justifyContent='space-between'
            alignItems='center'
            style={{ cursor: 'pointer', padding: '1rem' }}
        >
            <Text
                tabIndex={0}
                fontWeight='300'
                color={isOnSettingsPage ? 'text2' : 'negative'}
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'center',
                }}
            >
                {isOnSettingsPage
                    ? 'Show position reset modal.'
                    : 'Do not show me this again.'}
            </Text>
            <Toggle
                isOn={
                    isOnSettingsPage
                        ? !doNotShowPositionReset
                        : doNotShowPositionReset
                }
                handleToggle={() => {
                    setDoNotShowPositionReset(!doNotShowPositionReset);
                }}
                id='do_not_show_positions_toggle'
                disabled={false}
            />
        </FlexContainer>
    );
}
