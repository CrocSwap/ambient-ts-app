import styled from 'styled-components';
import DoNotShowPositionReset from '../../components/Global/SettingsComponents/DoNotShowPositionReset';
import { Text } from '../../styled/Common';

const Container = styled.div`
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;
const TogglesContainer = styled.div`
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    background: var(--dark2);
`;

export default function Settings() {
    return (
        <Container>
            <Text fontSize='header2' color='accent5'>
                APP SETTINGS
            </Text>
            <TogglesContainer>
                <DoNotShowPositionReset />
            </TogglesContainer>
        </Container>
    );
}
