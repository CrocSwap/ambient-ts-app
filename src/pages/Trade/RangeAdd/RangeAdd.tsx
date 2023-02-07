import styles from './RangeAdd.module.css';
// import { useLocation } from 'react-router-dom';
import RangeAddHeader from '../../../components/Trade/RangeAdd/RangeAddHeader/RangeAddHeader';
// import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';

export default function RangeAdd() {
    // const location = useLocation();

    // const currentLocation = location.pathname;

    // const repositionAddToggle = (
    //     <div className={styles.reposition_toggle_container}>
    //         <Link
    //             to='/trade/reposition'
    //             className={
    //                 currentLocation.includes('reposition')
    //                     ? styles.active_button_toggle
    //                     : styles.non_active_button_toggle
    //             }
    //         >
    //             Reposition
    //         </Link>
    //         <Link
    //             to='/trade/add'
    //             className={
    //                 currentLocation.includes('add')
    //                     ? styles.active_button_toggle
    //                     : styles.non_active_button_toggle
    //             }
    //         >
    //             Add
    //         </Link>
    //     </div>
    // );

    return (
        <div className={styles.container}>
            <RangeAddHeader />
            <div className={styles.content}>
                {/* {repositionAddToggle} */}
                {/* <RepositionDenominationSwitch /> */}
                <DividerDark />
                this is the add component
            </div>
        </div>
    );
}
