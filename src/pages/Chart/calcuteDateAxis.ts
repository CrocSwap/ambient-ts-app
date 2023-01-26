/* eslint-disable @typescript-eslint/no-explicit-any */
export const getOneHourAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    data.forEach((element: any) => {
        if (
            tempArray.length === 0 ||
            element.toDateString() !== tempArray[tempArray.length - 1].toDateString()
        ) {
            element.setMinutes(0);
            if (bandwidth > 60) {
                for (let i = 0; i < 24; i++) {
                    const res = new Date(element.setHours(i));
                    tempArray.push(res);
                }
            } else if (bandwidth > 20 && bandwidth <= 60) {
                for (let i = 0; i < 8; i++) {
                    const res = new Date(element.setHours(3 * i));
                    tempArray.push(res);
                }
            } else if (bandwidth < 20 && bandwidth >= 10) {
                for (let i = 0; i < 4; i++) {
                    const res = new Date(element.setHours(6 * i));
                    tempArray.push(res);
                }
            } else if (bandwidth < 10 && bandwidth >= 3) {
                for (let i = 0; i < 2; i++) {
                    const res = new Date(element.setHours(12 * i));
                    tempArray.push(res);
                }
            } else {
                tempArray.push(element);
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const getOneDayAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    data.forEach((element: any) => {
        const tempfirstDayMonth = new Date(element);
        tempfirstDayMonth.setDate(1);
        if (
            tempfirstDayMonth &&
            tempArray.find((item: any) => item.getTime() === tempfirstDayMonth.getTime()) ===
                undefined
        ) {
            tempArray.push(tempfirstDayMonth);
        }

        if (bandwidth >= 40) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 60 * 24 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        }

        if (bandwidth < 40 && bandwidth > 30) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 12; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 60 * 24 * 2 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        }

        if (bandwidth < 30 && bandwidth > 10) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 1; i < 5; i += 3) {
                const tempData = new Date(res.setTime(res.getTime() + 60 * 24 * i * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        }

        if (bandwidth <= 10) {
            const tempData = new Date(element.setDate(15));
            if (
                tempArray.find((item: any) => item.getTime() === tempData.getTime()) === undefined
            ) {
                tempArray.push(tempData);
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const get4HoursAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    let tempDate: any;
    data.forEach((element: any) => {
        const tempfirstDayMonth = new Date(element);
        tempfirstDayMonth.setDate(1);

        if (
            tempfirstDayMonth &&
            tempArray.find((item: any) => item.getTime() === tempfirstDayMonth.getTime()) ===
                undefined
        ) {
            tempArray.push(tempfirstDayMonth);
        }

        if (bandwidth > 50) {
            const tempfirstDayMonth = new Date(element);
            tempfirstDayMonth.setHours(0);
            if (
                tempfirstDayMonth &&
                tempArray.find((item: any) => item.getTime() === tempfirstDayMonth.getTime()) ===
                    undefined
            ) {
                tempArray.push(tempfirstDayMonth);
            }
            tempDate = new Date(element.setHours(6));
            for (let i = 0; i <= 4; i++) {
                const res = new Date(element.setHours(tempDate.getHours() + i * 4));

                if (
                    res &&
                    tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined
                ) {
                    tempArray.push(res);
                }
            }

            if (
                tempDate &&
                tempArray.find((item: any) => item.getTime() === tempDate.getTime()) === undefined
            ) {
                tempArray.push(tempDate);
            }
        }

        if (bandwidth <= 50 && bandwidth > 30) {
            const tempfirstDayMonth = new Date(element);
            tempfirstDayMonth.setHours(0);
            if (
                tempfirstDayMonth &&
                tempArray.find((item: any) => item.getTime() === tempfirstDayMonth.getTime()) ===
                    undefined
            ) {
                tempArray.push(tempfirstDayMonth);
            }

            const res = new Date(element.setHours(14));

            if (
                res &&
                tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined
            ) {
                tempArray.push(res);
            }
        }

        if (bandwidth < 30) {
            if (
                element &&
                tempArray.find((item: any) => item.getTime() === element.getTime()) === undefined
            ) {
                tempArray.push(element);
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const get15MinutesAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];

    if (bandwidth >= 20) {
        return data;
    }

    data.forEach((element: any) => {
        if (bandwidth < 20 && bandwidth >= 10) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 90 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        }

        if (bandwidth < 10) {
            for (let i = 0; i < 4; i++) {
                const res = new Date(element.setHours(6 * i));
                if (tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined) {
                    tempArray.push(res);
                }
            }
        }

        if (bandwidth <= 5) {
            for (let i = 0; i < 2; i++) {
                const res = new Date(element.setHours(12 * i));
                if (tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined) {
                    tempArray.push(res);
                }
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const get5MinutesAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];

    if (bandwidth >= 50) {
        return data;
    }

    if (bandwidth < 50 && bandwidth >= 30) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 10 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth < 30 && bandwidth > 10) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 15 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth < 10 && bandwidth > 5) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 30 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth <= 5) {
        data.forEach((element: any) => {
            for (let i = 0; i < 24; i++) {
                const res = new Date(element.setHours(i));
                if (tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined) {
                    tempArray.push(res);
                }
            }
        });
    }

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const get1MinuteAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];

    if (bandwidth >= 40) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            for (let i = 0; i < 60; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 1 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }
    if (bandwidth < 40 && bandwidth >= 20) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            for (let i = 0; i < 20; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 3 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth < 20 && bandwidth > 10) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            for (let i = 0; i < 15; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 5 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth <= 10 && bandwidth > 5) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            for (let i = 0; i < 6; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 10 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }

    if (bandwidth <= 5) {
        data.forEach((element: any) => {
            const res = new Date(element);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            for (let i = 0; i < 4; i++) {
                const tempData = new Date(res.setTime(res.getTime() + 15 * 60 * 1000));
                if (
                    tempArray.find((item: any) => item.getTime() === tempData.getTime()) ===
                    undefined
                ) {
                    tempArray.push(tempData);
                }
            }
        });
    }
    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};
