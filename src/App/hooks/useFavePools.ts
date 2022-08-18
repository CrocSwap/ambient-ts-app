import { useState } from 'react';

export const useFavePools = () => {
    const userData = JSON.parse(localStorage.user);
    const [ favePools, setFavePools ] = useState(userData.favePools);

    const addPoolToFaves = () => {
        setFavePools([]);
    }

    const removePoolFromFaves = () => {
        setFavePools([]);
    }

    return [
        favePools,
        addPoolToFaves,
        removePoolFromFaves
    ];
}