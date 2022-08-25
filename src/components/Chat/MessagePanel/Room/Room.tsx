import styles from './Room.module.css';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { Dispatch, SetStateAction } from 'react';

interface RoomProps {
    favePools: PoolIF[];
    selectedRoom: string;
    setRoom: any;
}

export default function Room(props: RoomProps) {
    const defaultRooms = [
        {
            id: 100,
            name: 'Global',
        },
        {
            id: 101,
            name: 'Current Pool',
        },
    ];

    const rooms = props.favePools;
    return (
        <div className={styles.room_body}>
            <select
                className={styles.dropdown}
                onChange={(event: any) => {
                    props.setRoom(event.target.value);
                }}
                defaultValue={props.selectedRoom}
            >
                {defaultRooms.map((tab) => (
                    <option className={styles.dropdown_item} key={tab.id} value={tab.name}>
                        {tab.name}
                    </option>
                ))}
                {rooms.map((pool: PoolIF, i) => (
                    <option
                        className={styles.dropdown_item}
                        key={i}
                        value={pool.base.symbol + pool.quote.symbol}
                    >
                        {pool.base.symbol} / {pool.quote.symbol}
                    </option>
                ))}
            </select>
        </div>
    );
}
