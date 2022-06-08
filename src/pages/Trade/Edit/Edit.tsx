import ComponentToggle from '../../../components/Trade/Edit/ComponentToggle/ComponentToggle';
import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams } from 'react-router-dom';
import CurrencyDisplay from '../../../components/Global/CurrencyDisplay/CurrencyDisplay';
import CurrencyDisplayContainer from '../../../components/Trade/Edit/CurrencyDisplayContainer/CurrencyDisplayContainer';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';

// interface EditProps {
//     children: React.ReactNode;
// }

export default function Edit() {
    const { positionHash } = useParams();
    console.log(positionHash);
    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            {/* <ComponentToggle /> */}
            <CurrencyDisplayContainer />
            <MinMaxPrice />
        </div>
    );
}
