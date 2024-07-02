import React from 'react';
import PlatformAmbientRoutes from './PlatformAmbient';
import PlatformFutaRoutes from './PlatformFuta';
import CommonRoutes from './CommonRoutes';

const getRoutes = (platformName: string) => {
    if (platformName === 'futa') {
        return <PlatformFutaRoutes />;
    } else return <PlatformAmbientRoutes />;
};

export const RouteRenderer: React.FC<{ platformName: string }> = ({
    platformName,
}) => {
    return (
        <>
            {getRoutes(platformName)}
            <CommonRoutes />
        </>
    );
};

export default getRoutes;
