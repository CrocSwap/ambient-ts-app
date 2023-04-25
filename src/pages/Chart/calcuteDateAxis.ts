/* eslint-disable @typescript-eslint/no-explicit-any */

const oneDay = 24 * 60 * 60 * 1000;

const addFirstDayMonth = (data: any[]) => {
    const tempArray: any = [];
    data.forEach((element) => {
        const tempfirstDayMonth = new Date(element);
        tempfirstDayMonth.setDate(1);
        tempfirstDayMonth.setHours(0);
        if (
            tempArray.find(
                (item: any) =>
                    item.date.getTime() === tempfirstDayMonth.getTime(),
            ) === undefined
        ) {
            tempArray.push({ date: tempfirstDayMonth, style: true });
        }
    });

    return tempArray;
};

const filterYears = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item.date &&
                endDate > item.date &&
                (item.date.getDate() === 1 &&
                    item.date.getMonth() === 0 &&
                    item.date.getHours()) === 0,
        ).length === 0
    );
};
const filteredFirstDay = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item.date &&
                endDate > item.date &&
                (item.date.getDate() === 1 && item.date.getHours()) === 0,
        ).length === 0
    );
};

const filteredHour = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item.date &&
                endDate > item.date &&
                item.date.getHours() === 0 &&
                item.date.getMinutes() === 0,
        ).length === 0
    );
};

const filteredMinute = (
    startDate: Date,
    endDate: Date,
    data: any,
    minuteControl: number,
) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item.date &&
                endDate > item.date &&
                item.date.getMinutes() === minuteControl,
        ).length === 0
    );
};

function isLastOrSecondDayOfMonth(date: Date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.getMonth() !== date.getMonth() || date.getDate() === 2;
}

const correctStyleForData = (startDate: Date, endDate: Date, data: any) => {
    if (!filterYears(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item.date,
                style:
                    item.date.getHours() === 0 &&
                    item.date.getMonth() === 0 &&
                    item.date.getDate() === 1,
            };
        });
    } else if (!filteredFirstDay(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item.date,
                style: item.date.getHours() === 0 && item.date.getDate() === 1,
            };
        });
    } else if (!filteredHour(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item.date,
                style:
                    item.date.getHours() === 0 && item.date.getMinutes() === 0,
            };
        });
    } else if (!filteredMinute(startDate, endDate, data, 0)) {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 0 };
        });
    } else if (!filteredMinute(startDate, endDate, data, 5)) {
        data = data.map((item: any) => {
            return { date: item.date, style: true };
        });
    } else if (!filteredMinute(startDate, endDate, data, 10)) {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 10 };
        });
    } else if (!filteredMinute(startDate, endDate, data, 15)) {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 15 };
        });
    } else if (!filteredMinute(startDate, endDate, data, 30)) {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 30 };
        });
    } else if (!filteredMinute(startDate, endDate, data, 45)) {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 45 };
        });
    } else {
        data = data.map((item: any) => {
            return { date: item.date, style: item.date.getMinutes() === 45 };
        });
    }

    return data;
};

export const getHourAxisTicks = (
    startDate: Date,
    endDate: Date,
    data: any[],
    bandwidth: number,
    hour: number,
) => {
    let tempArray: any = [];

    tempArray = [...addFirstDayMonth(data)];

    data.forEach((element: any) => {
        element.setMinutes(0);
        if (bandwidth > 60) {
            for (let i = 0; i < 24; i += hour) {
                const res = new Date(element.setHours(i));
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({
                        date: res,
                        style: res.getDate() === 1 && res.getHours() === 0,
                    });
                }
            }
        } else if (bandwidth > 20 && bandwidth <= 60) {
            for (let i = 0; i < 8; i += hour) {
                const res = new Date(element.setHours(3 * i));
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({
                        date: res,
                        style: res.getDate() === 1 && res.getHours() === 0,
                    });
                }
            }
        } else if (bandwidth < 20 && bandwidth >= 10) {
            for (let i = 0; i < 4; i += hour) {
                const res = new Date(element.setHours(6 * i));
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === res.getTime(),
                    ) === undefined &&
                    !isLastOrSecondDayOfMonth(res)
                ) {
                    tempArray.push({
                        date: res,
                        style: res.getDate() === 1 && res.getHours() === 0,
                    });
                }
            }
        } else if (bandwidth < 10 && bandwidth >= 3) {
            for (let i = 0; i < 2; i += hour) {
                const res = new Date(element.setHours(12 * i));
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === res.getTime(),
                    ) === undefined &&
                    !(hour === 4 && isLastOrSecondDayOfMonth(res))
                ) {
                    tempArray.push({
                        date: res,
                        style: res.getDate() === 1 && res.getHours() === 0,
                    });
                }
            }
        } else {
            if (
                tempArray.find(
                    (item: any) => item.date.getTime() === element.getTime(),
                ) === undefined &&
                !(hour === 4 && isLastOrSecondDayOfMonth(element))
            ) {
                tempArray.push({ date: element, style: false });
            }
        }
    });

    const _resData: any = correctStyleForData(startDate, endDate, tempArray);

    return _resData.sort(
        (a: any, b: any) => b.date.getTime() - a.date.getTime(),
    );
};

export const getOneDayAxisTicks = (
    startDate: Date,
    endDate: Date,
    data: any[],
    bandwidth: number,
) => {
    let tempArray: any = [];

    tempArray = addFirstDayMonth(data);

    data.forEach((element: any) => {
        if (bandwidth >= 60) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + oneDay));
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === tempData.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: tempData, style: false });
                }
            }
        }

        if (bandwidth >= 40) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 16; i++) {
                const tempData = new Date(res.setTime(res.getTime() + oneDay));
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === tempData.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: tempData, style: false });
                }
            }
        }

        if (bandwidth < 40 && bandwidth > 30) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 0; i < 12; i++) {
                const tempData = new Date(
                    res.setTime(res.getTime() + 2 * oneDay),
                );
                if (
                    tempArray.find((item: any) => {
                        return item.date.getTime() === tempData.getTime();
                    }) === undefined
                ) {
                    tempArray.push({ date: tempData, style: false });
                }
            }
        }

        if (bandwidth < 30 && bandwidth > 10) {
            const res = new Date(element);
            res.setHours(0);
            res.setMinutes(0);
            for (let i = 1; i < 5; i += 3) {
                const tempData = new Date(
                    res.setTime(res.getTime() + i * oneDay),
                );
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === tempData.getTime(),
                    ) === undefined &&
                    !isLastOrSecondDayOfMonth(tempData)
                ) {
                    tempArray.push({ date: tempData, style: false });
                }
            }
        }

        if (bandwidth >= 5 && bandwidth <= 10) {
            const tempData = new Date(element.setDate(15));
            if (
                tempArray.find(
                    (item: any) => item.date.getTime() === tempData.getTime(),
                ) === undefined &&
                !isLastOrSecondDayOfMonth(tempData)
            ) {
                tempArray.push({ date: tempData, style: false });
            }
        }
    });

    const _resData: any = correctStyleForData(startDate, endDate, tempArray);

    return _resData.sort(
        (a: any, b: any) => b.date.getTime() - a.date.getTime(),
    );
};

export const get15MinutesAxisTicks = (
    startDate: Date,
    endDate: Date,
    data: any[],
    bandwidth: number,
) => {
    const tempArray: any = [];

    if (bandwidth >= 40) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 15) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 40 && bandwidth >= 15) {
        data.forEach((element: any) => {
            for (let i = 0; i < 24; i += 1) {
                element.setHours(i);
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === element.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(element), style: false });
                }
            }
        });
    }

    if (bandwidth < 15 && bandwidth >= 10) {
        data.forEach((element: any) => {
            for (let i = 0; i < 24; i += 2) {
                element.setHours(i);
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === element.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(element), style: false });
                }
            }
        });
    }

    if (bandwidth <= 10 && bandwidth >= 3) {
        data.forEach((element: any) => {
            for (let i = 0; i < 24; i += 4) {
                element.setHours(i);
                if (
                    tempArray.find(
                        (item: any) =>
                            item.date.getTime() === element.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(element), style: false });
                }
            }
        });
    }
    if (bandwidth < 3) {
        data.forEach((element: any) => {
            element.setHours(0);
            if (
                tempArray.find(
                    (item: any) => item.date.getTime() === element.getTime(),
                ) === undefined
            ) {
                tempArray.push({ date: new Date(element), style: false });
            }
        });
    }

    const _resData: any = correctStyleForData(startDate, endDate, tempArray);

    return _resData.sort(
        (a: any, b: any) => b.date.getTime() - a.date.getTime(),
    );
};

export const get5MinutesAxisTicks = (
    startDate: Date,
    endDate: Date,
    data: any[],
    bandwidth: number,
) => {
    const tempArray: any = [];

    if (bandwidth >= 50) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 5) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 50 && bandwidth >= 30) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 10) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 30 && bandwidth > 20) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 15) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 20 && bandwidth > 10) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 30) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth <= 10 && bandwidth >= 5) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 60) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 5) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 60) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    const _resData: any = correctStyleForData(startDate, endDate, tempArray);

    return _resData.sort(
        (a: any, b: any) => b.date.getTime() - a.date.getTime(),
    );
};

export const get1MinuteAxisTicks = (
    startDate: Date,
    endDate: Date,
    data: any[],
    bandwidth: number,
) => {
    const tempArray: any = [];

    if (bandwidth >= 40) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 1) {
                const _res = new Date(element.getTime());
                _res.setSeconds(0);
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }
    if (bandwidth < 40 && bandwidth >= 20) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 3) {
                const _res = new Date(element.getTime());
                _res.setSeconds(0);
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth < 20 && bandwidth > 10) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 5) {
                const _res = new Date(element.getTime());
                _res.setSeconds(0);
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    if (bandwidth <= 10 && bandwidth >= 5) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 10) {
                const _res = new Date(element.getTime());
                _res.setSeconds(0);
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }
    if (bandwidth < 5) {
        data.forEach((element: any) => {
            for (let i = 0; i < 60; i += 60) {
                const _res = new Date(element.getTime());
                _res.setMinutes(i);
                if (
                    tempArray.find(
                        (item: any) => item.date.getTime() === _res.getTime(),
                    ) === undefined
                ) {
                    tempArray.push({ date: new Date(_res), style: false });
                }
            }
        });
    }

    const _resData: any = correctStyleForData(startDate, endDate, tempArray);

    return _resData.sort(
        (a: any, b: any) => b.date.getTime() - a.date.getTime(),
    );
};
