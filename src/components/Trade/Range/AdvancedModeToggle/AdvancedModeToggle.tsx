import { memo, useContext } from 'react';
import { RangeContext } from '../../../../contexts/RangeContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import Toggle from '../../../Form/Toggle';

function AdvancedModeToggle() {
    const { advancedMode, setAdvancedMode } = useContext(RangeContext);

    const handleToggle = () => setAdvancedMode(!advancedMode);

    return (
        <FlexContainer
            fullWidth
            alignItems='center'
            gap={4}
            id='range_advance_mode_toggle_container'
            aria-label='Advanced mode toggle'
        >
            <Toggle
                isOn={!advancedMode}
                handleToggle={handleToggle}
                id='advanced_reposition'
            />
            <Text fontSize='body' color='text2'>
                Balanced
            </Text>
        </FlexContainer>
    );
}

export default memo(AdvancedModeToggle);
