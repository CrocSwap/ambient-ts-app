import React from 'react';
import styles from './TokenDetailsHeader.module.css';
import { MdArrowBackIosNew } from 'react-icons/md';
import { IoShareSocial } from 'react-icons/io5';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { BiArrowBack } from 'react-icons/bi';
export default function TokenDetailsHeader() {
    const smallHeight = useMediaQuery('(max-height: 800px)');
    const desktopScreen = useMediaQuery('(min-width: 768px)');

    const containerStyle: React.CSSProperties = {
        backgroundImage:
            'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)) ,url("https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp")',

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
        padding: '0 8px',

        borderRadius: '8px',
    };
    const imgContainerStyle: React.CSSProperties = {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
    };

    const bottomStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
        padding: '4px 2rem',
    };

    const img =
        'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp';

    const desktopDisplay = (
        <div style={containerStyle}>
            <div>
                <BiArrowBack size={30} />
            </div>

            <div style={bottomStyle}>
                <div style={imgContainerStyle}>
                    <img
                        src={img}
                        alt=''
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: '8px',
                        }}
                    />
                </div>

                <div className={styles.link_container}>
                    <IoShareSocial size={42} />
                </div>
            </div>
        </div>
    );

    if (smallHeight) return null;
    if (desktopScreen) return desktopDisplay;

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
