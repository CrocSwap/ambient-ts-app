import styles from './TokenListCard.module.css';
import Toggle from '../../Global/Toggle/Toggle';
import { TokenListIF } from '../../../utils/interfaces/exports';

interface TokenListProps {
    list: TokenListIF;
    activeLists: [];
    listIsActive: boolean;
    toggleActiveState: () => void;
}

export default function TokenListCard(props: TokenListProps) {
    const { list, listIsActive, toggleActiveState } = props;

    const cardBackground = listIsActive ? '#7371FC ' : '';

    return (
        <div className={styles.token_list_card_container}>
            <div
                className={styles.token_list_card_content}
                style={{ backgroundColor: cardBackground }}
            >
                <div className={styles.left_content}>
                    <img src={list.logoURI} alt='' width='40px' />
                    <div className={styles.token_list_card_name}>
                        <span> {list?.name}</span>
                        <div className={styles.token_count}>{list?.tokens?.length} tokens</div>
                    </div>
                </div>
                <div className={styles.right_content}>
                    <Toggle
                        isOn={listIsActive}
                        handleToggle={toggleActiveState}
                        // buttonColor={isChecked ? '#7371FC ' : '#565a69'}
                        Width={50}
                        id={`token-list-toggle-${list.uri}`}
                        // onColor={isChecked ? '#CDC1FF' : '#212429'}
                    />
                </div>
            </div>
        </div>
    );
}
