import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

const useDefaultUrlParams = () => {
    const { defaultUrlParams } = useContext(CrocEnvContext);
    return defaultUrlParams;
};

export default useDefaultUrlParams;
