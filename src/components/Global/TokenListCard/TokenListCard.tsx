import styles from './TokenListCard.module.css';
import Toggle from '../../Global/Toggle/Toggle';
import { TokenListIF } from '../../../utils/interfaces/exports';
import { MenuItem, Menu } from '@material-ui/core';
import { useState } from 'react';

interface TokenListProps {
    list: TokenListIF;
    activeLists: [];
    listIsActive: boolean;
    toggleActiveState: () => void;
}

export default function TokenListCard(props: TokenListProps) {
    const [anchorEl, setAnchorEl] = useState(null);
    const { list, listIsActive, toggleActiveState } = props;

    const cardBackground = listIsActive ? '#7371FC ' : '';

    const handleClick = (event: React.ChangeEvent<any>) => {
        console.log('handleClick', event.currentTarget);
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        console.log('handleClose');
        setAnchorEl(null);
    };

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

                        <div
                            aria-controls='list settings'
                            aria-haspopup='true'
                            onClick={handleClick}
                            className={styles.menu}
                        >
                            Open Menu
                        </div>
                    </div>
                    <Menu
                        id='simple-menu'
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleClose}>Item 1</MenuItem>
                        <MenuItem onClick={handleClose}>Item 2</MenuItem>
                    </Menu>
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
