import styles from './SetPoolFees.module.css';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Toggle2 from '../../Global/Toggle/Toggle2';
interface SetPoolFeesPropsIF {
    animation: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
}
export default function SetPoolFees(props: SetPoolFeesPropsIF) {
    const { animation } = props;
    const [fee, setFee] = useState('0.3');
    const [ambientControl, setAmbientControl] = useState(false);

    const preset1 = '0.1';
    const preset2 = '0.3';
    const preset3 = '0.5';

    const allowAmbientControl = (
        <div className={styles.ambient_control}>
            <p>Allow Ambient Finance to manage fees</p>
            <Toggle2
                id='allow_ambi_man_fees'
                isOn={ambientControl}
                handleToggle={() => setAmbientControl(!ambientControl)}
            />
        </div>
    );

    return (
        <motion.div
            variants={animation}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.2 }}
        >
            <div className={styles.slippage_tolerance_container}>
                <div className={styles.slippage_title}>Initial pool fee (%)</div>
                <p className={styles.help_guide}>
                    0.30% is best for most weighted pools with established tokens. Go higher for
                    more exotic tokens.
                </p>
                <div className={styles.slippage_box}>
                    <div className={styles.slippage_content}>
                        <div className={styles.input_container}>
                            <input
                                id='slippage_tolerance_input_field'
                                onChange={(e) => setFee(e.target.value)}
                                type='text'
                                value={fee}
                                placeholder={'slippage'}
                            />
                        </div>
                        <button onClick={() => setFee(preset1)}>{preset1}%</button>
                        <button onClick={() => setFee(preset2)}>{preset2}%</button>
                        <button onClick={() => setFee(preset3)}>{preset3}%</button>
                    </div>
                </div>
                {allowAmbientControl}
            </div>
        </motion.div>
    );
}
