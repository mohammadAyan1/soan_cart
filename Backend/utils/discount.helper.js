import { prisma } from "../config/prisma.js";

export const COUPON_TYPES = ["FLAT", "PERCENTAGE", "UPTO"];
export const COUPON_SCOPES = ["ALL", "PRODUCT", "VARIANT", "CATEGORY", "SUBCATEGORY"];

export class DiscountError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "DiscountError";
        this.status = status;
    }
}

export const parseBool = (v) => v === true || v === "true" || v === 1 || v === "1";

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// ------------------------------------------------------------------
// ADMIN side: create / update ke time body validate karke clean data banata hai
//   body     -> req.body
//   existing -> update me purana record (create me null)
//   label    -> "Coupon" ya "Reward" (sirf messages ke liye)
//   requireUser -> reward ke liye true (userId required)
// return: { error } ya { data }
// ------------------------------------------------------------------
export async function buildDiscountData(body, existing = null, { label = "Coupon", requireUser = false } = {}) {
    const pick = (key) => (body[key] !== undefined ? body[key] : existing ? existing[key] : undefined);
    const fail = (message) => ({ error: message });

    // ---------- code ----------
    let code = pick("code");
    if (typeof code !== "string" || !code.trim()) {
        return fail(`${label} code required hai`);
    }
    code = code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
        return fail(`${label} code 3-30 characters ka hona chahiye (sirf A-Z, 0-9, _ aur -)`);
    }

    // ---------- type ----------
    const type = String(pick("type") || "").toUpperCase();
    if (!COUPON_TYPES.includes(type)) {
        return fail(`type ${COUPON_TYPES.join(" / ")} me se hona chahiye`);
    }

    // ---------- value ----------
    const value = Number(pick("value"));
    if (!Number.isFinite(value) || value <= 0) {
        return fail("value 0 se bada number hona chahiye");
    }
    if (type !== "FLAT" && value > 100) {
        return fail("PERCENTAGE / UPTO me value 100 se zyada nahi ho sakti");
    }

    // ---------- maxDiscountAmount (sirf UPTO) ----------
    let maxDiscountAmount = null;
    if (type === "UPTO") {
        maxDiscountAmount = Number(pick("maxDiscountAmount"));
        if (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0) {
            return fail("UPTO type ke liye maxDiscountAmount (0 se bada) required hai");
        }
    }

    // ---------- perUserLimit (null = unlimited) ----------
    let perUserLimit = pick("perUserLimit");
    if (perUserLimit === undefined || perUserLimit === null || perUserLimit === "") {
        perUserLimit = null;
    } else {
        perUserLimit = Number(perUserLimit);
        if (!Number.isInteger(perUserLimit) || perUserLimit < 1) {
            return fail("perUserLimit 1 ya usse bada whole number hona chahiye (unlimited ke liye mat bhejo)");
        }
    }

    // ---------- expiryDate (hamesha future) ----------
    let expiryDate;
    if (body.expiryDate !== undefined && body.expiryDate !== null && body.expiryDate !== "") {
        expiryDate = new Date(body.expiryDate);
        if (isNaN(expiryDate.getTime())) {
            return fail("expiryDate valid date nahi hai");
        }
        // sirf date (YYYY-MM-DD) aaye to us din ke end tak valid rakho
        if (typeof body.expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.expiryDate.trim())) {
            expiryDate.setHours(23, 59, 59, 999);
        }
        if (expiryDate <= new Date()) {
            return fail("expiryDate hamesha future ki honi chahiye");
        }
    } else if (existing) {
        expiryDate = existing.expiryDate;
    } else {
        return fail("expiryDate required hai");
    }

    // ---------- scope ----------
    const scope = String(pick("scope") || "ALL").toUpperCase();
    if (!COUPON_SCOPES.includes(scope)) {
        return fail(`scope ${COUPON_SCOPES.join(" / ")} me se hona chahiye`);
    }

    let productId = null;
    let variantId = null;
    let categoryId = null;
    let subCategoryId = null;

    if (scope === "PRODUCT") {
        productId = Number(pick("productId"));
        if (!productId) return fail("PRODUCT scope ke liye productId required hai");
        const product = await prisma.product.findFirst({ where: { id: productId, isDelete: false } });
        if (!product) return fail("Product nahi mila");
    }

    if (scope === "VARIANT") {
        variantId = Number(pick("variantId"));
        if (!variantId) return fail("VARIANT scope ke liye variantId required hai");
        const variant = await prisma.productVariant.findFirst({ where: { id: variantId, isDelete: false } });
        if (!variant) return fail("Product variant nahi mila");
        productId = variant.productId; // sirf info ke liye, check variantId pe hi hoga
    }

    if (scope === "CATEGORY") {
        categoryId = Number(pick("categoryId"));
        if (!categoryId) return fail("CATEGORY scope ke liye categoryId required hai");
        const category = await prisma.productCategory.findFirst({ where: { id: categoryId, isDelete: false } });
        if (!category) return fail("Category nahi mili");
    }

    if (scope === "SUBCATEGORY") {
        subCategoryId = Number(pick("subCategoryId"));
        if (!subCategoryId) return fail("SUBCATEGORY scope ke liye subCategoryId required hai");
        const subCategory = await prisma.productSubCategory.findFirst({ where: { id: subCategoryId, isDelete: false } });
        if (!subCategory) return fail("Sub category nahi mili");
    }

    // ---------- userId (sirf reward ke liye) ----------
    let userId = null;
    if (requireUser) {
        userId = Number(pick("userId"));
        if (!userId) return fail("Reward kis user ke liye hai, userId required hai");
        const user = await prisma.user.findFirst({ where: { id: userId, isDelete: false } });
        if (!user) return fail("User nahi mila");
    }

    const rawDescription = pick("description");
    const description =
        typeof rawDescription === "string" && rawDescription.trim() ? rawDescription.trim() : null;

    return {
        data: {
            code,
            description,
            type,
            value,
            maxDiscountAmount,
            perUserLimit,
            expiryDate,
            scope,
            productId,
            variantId,
            categoryId,
            subCategoryId,
            ...(requireUser && { userId }),
        },
    };
}

// ------------------------------------------------------------------
// CHECKOUT side helpers
// ------------------------------------------------------------------

// line = { key, productId, variantId, categoryId, subCategoryId, lineTotal }
function isLineEligible(target, line) {
    switch (target.scope) {
        case "PRODUCT":
            return line.productId === target.productId;
        case "VARIANT":
            return line.variantId === target.variantId;
        case "CATEGORY":
            return line.categoryId != null && line.categoryId === target.categoryId;
        case "SUBCATEGORY":
            return line.subCategoryId != null && line.subCategoryId === target.subCategoryId;
        default:
            return true; // ALL
    }
}

const NOT_ELIGIBLE_MESSAGE = {
    PRODUCT: "sirf specific product pe valid hai",
    VARIANT: "sirf specific product variant pe valid hai",
    CATEGORY: "sirf specific category ke products pe valid hai",
    SUBCATEGORY: "sirf specific sub category ke products pe valid hai",
    ALL: "is order pe valid nahi hai",
};

// total discount ko eligible lines me proportionally baant do
function distribute(total, lines) {
    const eligibleTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const map = new Map();
    let allocated = 0;
    lines.forEach((l, i) => {
        const share =
            i === lines.length - 1
                ? round2(total - allocated)
                : round2((total * l.lineTotal) / eligibleTotal);
        map.set(l.key, share);
        allocated = round2(allocated + share);
    });
    return map;
}

// Coupon / Reward validate karke discount nikalta hai (transaction ke andar call karo)
// return: null (koi code nahi diya) ya { kind, record, code, discountAmount, perLine }
export async function resolveDiscountForCheckout(tx, { userId, couponCode, rewardCode, lines }) {
    const cCode = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
    const rCode = typeof rewardCode === "string" ? rewardCode.trim().toUpperCase() : "";

    if (cCode && rCode) {
        throw new DiscountError("Ek order me coupon aur reward dono saath me use nahi ho sakte", 400);
    }
    if (!cCode && !rCode) return null;

    const kind = cCode ? "COUPON" : "REWARD";
    const label = kind === "COUPON" ? "Coupon" : "Reward";

    const record =
        kind === "COUPON"
            ? await tx.coupon.findUnique({ where: { code: cCode } })
            : await tx.reward.findUnique({ where: { code: rCode } });

    // reward kisi dusre user ka ho to bhi same "invalid" message (info leak nahi)
    if (!record || record.isDelete || (kind === "REWARD" && record.userId !== userId)) {
        throw new DiscountError(`${label} code invalid hai`, 404);
    }
    if (!record.isActive) {
        throw new DiscountError(`${label} abhi active nahi hai`, 400);
    }
    if (new Date(record.expiryDate) <= new Date()) {
        throw new DiscountError(`${label} expire ho chuka hai`, 400);
    }

    // ---------- per user limit ----------
    if (record.perUserLimit !== null) {
        const usedCount =
            kind === "COUPON"
                ? await tx.couponUsage.count({ where: { couponId: record.id, userId, isActive: true } })
                : await tx.rewardUsage.count({ where: { rewardId: record.id, userId, isActive: true } });

        if (usedCount >= record.perUserLimit) {
            throw new DiscountError(
                `Aap ye ${label.toLowerCase()} max ${record.perUserLimit} baar hi use kar sakte ho, limit khatam ho gayi`,
                400
            );
        }
    }

    // ---------- eligible products ----------
    const eligibleLines = lines.filter((l) => isLineEligible(record, l));
    if (eligibleLines.length === 0) {
        throw new DiscountError(
            `Ye ${label.toLowerCase()} ${NOT_ELIGIBLE_MESSAGE[record.scope] || NOT_ELIGIBLE_MESSAGE.ALL}`,
            400
        );
    }

    const eligibleTotal = eligibleLines.reduce((s, l) => s + l.lineTotal, 0);
    const value = Number(record.value);

    // ---------- discount calculate ----------
    let discount = 0;
    if (record.type === "FLAT") {
        discount = value;
    } else if (record.type === "PERCENTAGE") {
        discount = (eligibleTotal * value) / 100;
    } else if (record.type === "UPTO") {
        discount = Math.min((eligibleTotal * value) / 100, Number(record.maxDiscountAmount));
    }

    discount = round2(Math.min(discount, eligibleTotal)); // eligible amount se zyada kabhi nahi

    if (discount <= 0) {
        throw new DiscountError(`Is order pe ${label.toLowerCase()} se koi discount nahi mil raha`, 400);
    }

    return {
        kind,
        record,
        code: record.code,
        discountAmount: discount,
        perLine: distribute(discount, eligibleLines),
    };
}

// order ban jaane ke baad usage record karo (transaction ke andar)
export async function recordDiscountUsage(tx, { discount, userId, orderId }) {
    if (!discount) return;

    if (discount.kind === "COUPON") {
        await tx.couponUsage.create({
            data: { couponId: discount.record.id, userId, orderId, discountAmount: discount.discountAmount },
        });
    } else {
        await tx.rewardUsage.create({
            data: { rewardId: discount.record.id, userId, orderId, discountAmount: discount.discountAmount },
        });
    }
}