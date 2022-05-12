import styles from 'ExtraInfo.module.css';
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';
interface ExtraInfoProps {
    children: React.ReactNode;
}

export default function ExtraInfo(props: ExtraInfoProps) {
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    return <div className={styles.row}>{props.children}</div>;
}
