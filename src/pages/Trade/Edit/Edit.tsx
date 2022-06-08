import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams } from 'react-router-dom';
import CurrencyDisplayContainer from '../../../components/Trade/Edit/CurrencyDisplayContainer/CurrencyDisplayContainer';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import EditPriceInfo from '../../../components/Trade/Edit/EditPriceInfo/EditPriceInfo';
import EditButton from '../../../components/Trade/Edit/EditButton/EditButton';
import Divider from '../../../components/Global/Divider/Divider';

// interface EditProps {
//     children: React.ReactNode;
// }

export default function Edit() {
    const { positionHash } = useParams();
    console.log(positionHash);
    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            <div className={styles.edit_content}>
                <CurrencyDisplayContainer />
                <Divider />
                <MinMaxPrice />
                <EditPriceInfo />
                <EditButton />
            </div>
        </div>
    );
}
