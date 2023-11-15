import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import Toggle from '../../../Form/Toggle';
import { memo } from 'react';
import { FlexContainer, Text } from '../../../../styled/Common';

interface propsIF {
    advancedMode: boolean;
}

function AdvancedModeToggle(props: propsIF) {
    const { advancedMode } = props;

    const dispatch = useAppDispatch();
    const handleToggle = () => dispatch(toggleAdvancedMode());

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
