// import blocktower from '../../../assets/images/investors/blocktower.svg';
// import jane from '../../../assets/images/investors/jane.svg';
// import circle from '../../../assets/images/investors/circle.svg';
// import tensai from '../../../assets/images/investors/tensai.png';
// import naval from '../../../assets/images/investors/naval.svg';
// import yunt from '../../../assets/images/investors/yunt.svg';
// import susa from '../../../assets/images/investors/susa.svg';
// import quantstamp from '../../../assets/images/investors/quantstamp.svg';
// import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
// import PositiveSum from '../../../assets/images/investors/positivesum.svg';
// import motivate from '../../../assets/images/investors/motivate.svg';

import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import {
    InvestorsContainer,
    InvestorsContent,
    MobileContainer,
    InvestorRow,
} from '../../../styled/Components/Home';
import { FlexContainer, GridContainer, Text } from '../../../styled/Common';
export default function Investors() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <InvestorsContainer>
            <Text
                color='text1'
                fontWeight='400'
                fontSize='header1'
                style={{ textAlign: 'center' }}
            >
                Our Investors
            </Text>
            {/* <InvestorsContent
                flexDirection='column'
                margin='16px auto 0 auto'
                gap={16}
            >
                {row1}
                {row2}
                {row3}
                {row4}
                {row5}
                {row6}
                {row7}
            </InvestorsContent> */}
        </InvestorsContainer>
    );
}
