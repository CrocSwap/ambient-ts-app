import { SMOLREFUEL_LINK } from '../../../ambient-utils/constants';
import { FlexContainer } from '../../../styled/Common';

export default function SmolRefuelLink() {
    return (
        <FlexContainer
            alignItems='center'
            gap={4}
            color='text2'
            fontSize='body'
            justifyContent='flex-end'
        >
            <span>Need Gas?</span>
            <FlexContainer
                alignItems='center'
                justifyContent='center'
                onClick={() => window.open(SMOLREFUEL_LINK)}
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
                <span>SmolRefuel</span>
            </FlexContainer>
        </FlexContainer>
    );
}
