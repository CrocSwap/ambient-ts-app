// START: Import React and Dongles
import { useState, MouseEvent } from 'react';
import { MenuItem, Menu } from '@material-ui/core';
import { RiFileList2Fill, RiRefreshFill } from 'react-icons/ri';

// START: Import Local Files
import styles from './TokenListCard.module.css';
import Toggle from '../../Global/Toggle/Toggle';
import { useStyles } from '../../../utils/functions/styles';
import { TokenListIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';
import refreshTokenList from './refreshTokenList';

interface propsIF {
    list: TokenListIF;
    activeLists: [];
    listIsActive: boolean;
    toggleActiveState: () => void;
}

export default function TokenListCard(props: propsIF) {
    const { list, listIsActive, toggleActiveState } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const classes = useStyles();

    const cardBackground = listIsActive ? ' ' : '';
    const cardBorder = listIsActive ? '1px solid #7371fc ' : '';

    const handleClick = (event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) =>
        setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    return (
        <div className={styles.token_list_card_container}>
            <div
                className={styles.token_list_card_content}
                style={{ backgroundColor: cardBackground, border: cardBorder }}
            >
                <div className={styles.left_content}>
                    <img
                        src={uriToHttp(list.logoURI)}
                        alt={`logo for the token list ${list.name}`}
                        width='40px'
                    />
                    <div className={styles.token_list_card_name}>
                        <div className={styles.token_list_name}>
                            <p>{list?.name}</p>
                            <RiRefreshFill
                                size={16}
                                onClick={() => refreshTokenList(list.uri as string)}
                            />
                        </div>
                        <div className={styles.bottom_container_menu}>
                            <div className={styles.token_count}>{list?.tokens?.length} tokens</div>
                            <div
                                aria-controls='list settings'
                                aria-haspopup='true'
                                onClick={handleClick}
                                className={styles.menu}
                            >
                                <div>
                                    {' '}
                                    <RiFileList2Fill size={15} />
                                </div>
                            </div>
                        </div>
                        <Menu
                            id='simple-menu'
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            className={classes.menu}
                        >
                            <MenuItem onClick={handleClose} className={classes.menuItem}>
                                <a
                                    href={'https://tokenlists.org/token-list?url=' + list.uri}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    View List
                                </a>
                            </MenuItem>
                            <MenuItem onClick={handleClose} className={classes.menuItem}>
                                Remove List
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
                <div className={styles.right_content}>
                    {list.uri !== '/ambient-token-list.json' && (
                        <Toggle
                            isOn={listIsActive}
                            handleToggle={toggleActiveState}
                            Width={50}
                            id={`token-list-toggle-${list.uri}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
