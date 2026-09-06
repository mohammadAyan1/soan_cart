// utils/priceUtils.js

export const getDiscountPercent = (mrp, actualPrice) => {
    const mrpNum = Number(mrp);
    const actualNum = Number(actualPrice);

    if (!mrpNum || !actualNum || mrpNum <= actualNum) return 0;

    const discount = ((mrpNum - actualNum) / mrpNum) * 100;
    return Math.round(discount);
};

export const formatPrice = (price) => {
    const num = Number(price) || 0;
    return `₹${num.toLocaleString("en-IN")}`;
};