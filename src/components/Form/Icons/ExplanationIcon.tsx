import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ExplanationButton } from './Icons.styles'; // Make sure to import it correctly

const ExplanationIcon = () => {
    return (
        <ExplanationButton>
            {' '}
            <AiOutlineInfoCircle color='var(--text2)' />
        </ExplanationButton>
    );
};

export default ExplanationIcon;
