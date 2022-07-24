import DropdownMenu from '../../../DropdownMenu/DropdownMenu';
import DropdownMenuContainer from '../../../DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
import DropdownMenuItem from '../../../DropdownMenu/DropdownMenuItem/DropdownMenuItem';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './TableMenuComponents.module.css';

export default function RangesMenu() {
    const rangesMenu = (
        <div className={styles.actions_menu}>
            <button>Edit</button>
            <button>Harvest</button>
            <button>Remove</button>
            <button>Details</button>
            <button>Copy</button>
        </div>
    );

    const dropdownRangesMenu = (
        <div className={styles.dropdown_menu}>
            <DropdownMenu title={<FiMoreHorizontal size={20} />}>
                <DropdownMenuContainer>
                    <DropdownMenuItem>
                        {' '}
                        <button>Edit</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        {' '}
                        <button>Harvest</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Remove</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Details</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Copy</button>
                    </DropdownMenuItem>
                </DropdownMenuContainer>
            </DropdownMenu>
        </div>
    );
    return (
        <>
            {rangesMenu}
            {dropdownRangesMenu}
        </>
    );
}
