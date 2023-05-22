const debounce = (func, wait = 500, immediate) => {
    let timer = null; // 定时器
    let result = null;
    return function (...params) {
        let context = this,
            now = immediate && !timer;
        // 在设置新的定时器之前要把之前的定时器销毁，只需要在一定的时间间隔wait中执行一次
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                result = func.apply(context, params);
            }
        }, wait);
        if (now) {
            result = func.apply(context, params);
        }
        return result;
    };
};

export {
    debounce
}