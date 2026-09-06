// ---------------------------------------------------------
// Chhote date helpers - kisi bhi date library ki zaroorat nahi
// ---------------------------------------------------------

export const isSameDay = (dateInput, referenceDate = new Date()) => {
    const d = new Date(dateInput);
    return (
        d.getFullYear() === referenceDate.getFullYear() &&
        d.getMonth() === referenceDate.getMonth() &&
        d.getDate() === referenceDate.getDate()
    );
};

export const isToday = (dateInput) => isSameDay(dateInput, new Date());

export const isCurrentMonth = (dateInput, referenceDate = new Date()) => {
    const d = new Date(dateInput);
    return (
        d.getFullYear() === referenceDate.getFullYear() &&
        d.getMonth() === referenceDate.getMonth()
    );
};

export const dayOfMonth = (dateInput) => new Date(dateInput).getDate();

export const formatINR = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

export const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    return new Date(dateInput).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatDateTime = (dateInput) => {
    if (!dateInput) return "-";
    return new Date(dateInput).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};