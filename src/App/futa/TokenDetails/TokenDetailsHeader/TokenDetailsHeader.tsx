import React from 'react';
import styles from './TokenDetailsHeader.module.css';
import { MdArrowBackIosNew } from 'react-icons/md';
import { IoShareSocial } from 'react-icons/io5';
export default function TokenDetailsHeader() {
    const img =
        'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp';
    return (
        <div className={styles.container}>
            <div className={styles.back_arrow}>
                <MdArrowBackIosNew size={42} />
            </div>

            <div className={styles.img_container}>
                <img src={img} alt='' />
            </div>

            <div className={styles.link_container}>
                <IoShareSocial size={42} />
            </div>
        </div>
    );
}
