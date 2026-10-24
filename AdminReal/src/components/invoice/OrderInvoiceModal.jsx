import React, { useRef } from 'react';

const OrderInvoiceModal = ({ order, onClose }) => {
    const printContentRef = useRef(null);

    if (!order) return null;

    // Format invoice date from order.createdAt
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Customer details
    const customerName = (order.fullName || order.user?.fullName || "Customer").toUpperCase();
    const customerPhone = order.phone || order.user?.phone || "";
    const customerAddress = order.addressLine || "";
    const customerCityState = [order.city, order.state, order.pincode].filter(Boolean).join(", ");
    const placeOfSupply = order.state || "Madhya Pradesh";

    // Items and calculations
    const items = order.items || [];
    let totalQty = 0;
    let computedTotalAmount = 0;

    const formattedItems = items.map((item, index) => {
        const qty = Number(item.quantity) || 1;
        // Rate must be actual price as requested by user
        const rate = Number(item.priceDetails?.actualPrice || item.price || item.variant?.actualPrice || 0);
        const amount = qty * rate;

        totalQty += qty;
        computedTotalAmount += amount;

        const productName = item.product?.productName || "Product";
        const variantDesc = item.variant?.description ? ` (${item.variant.description})` : "";
        const fullItemTitle = `${productName}${variantDesc}`.toUpperCase();

        return {
            sno: index + 1,
            title: fullItemTitle,
            qty,
            rate,
            sgst: "₹0.00",
            cgst: "₹0.00",
            amount,
        };
    });

    const finalTotalAmount = Number(order.totalAmount || computedTotalAmount || 0);
    const isPaid = order.paymentStatus === "PAID" || order.paymentStatus === "DELIVERED";
    const receivedAmount = isPaid ? finalTotalAmount : (order.orderType === "COD" ? 0 : finalTotalAmount);
    const balanceAmount = finalTotalAmount - receivedAmount;

    // Sequential, permanent invoice number independent of database ID
    const invoiceNumber = order.invoiceNumber || order.id;

    // Handle Print using dedicated printable iframe
    const handlePrint = () => {
        const content = printContentRef.current;
        if (!content) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.top = "-9999px";
        iframe.style.left = "-9999px";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice_${invoiceNumber}_${customerName.replace(/\\s+/g, '_')}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 12mm 10mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    }
                    body {
                        background: #fff;
                        color: #000;
                        font-size: 11px;
                        line-height: 1.3;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .invoice-container {
                        width: 100%;
                        border: 1.5px solid #000;
                        margin: 0 auto;
                    }
                    .header-title-bar {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 12px;
                        border-bottom: 1.5px solid #000;
                    }
                    .tax-invoice-text {
                        font-size: 16px;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                    }
                    .recipient-badge {
                        border: 1px solid #444;
                        padding: 2px 8px;
                        font-size: 10px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                    }
                    .grid-2-col {
                        display: flex;
                        border-bottom: 1.5px solid #000;
                    }
                    .col-left {
                        flex: 1.25;
                        padding: 10px 12px;
                        border-right: 1.5px solid #000;
                    }
                    .col-right {
                        flex: 1;
                        padding: 10px 12px;
                    }
                    .company-name {
                        font-size: 18px;
                        font-weight: 800;
                        margin-bottom: 4px;
                    }
                    .company-info {
                        font-size: 11px;
                        line-height: 1.4;
                        color: #111;
                    }
                    .invoice-meta-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                    }
                    .meta-block {
                        flex: 1;
                    }
                    .meta-label {
                        font-size: 11px;
                        font-weight: 700;
                        margin-bottom: 2px;
                    }
                    .meta-value {
                        font-size: 13px;
                        font-weight: 800;
                    }
                    .section-title {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                        color: #333;
                    }
                    .customer-name {
                        font-size: 13px;
                        font-weight: 800;
                        margin-bottom: 3px;
                    }
                    .customer-info {
                        font-size: 11px;
                        line-height: 1.35;
                    }
                    table.items-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table.items-table th, table.items-table td {
                        border-right: 1px solid #000;
                        border-bottom: 1px solid #000;
                        padding: 6px 8px;
                    }
                    table.items-table th:last-child, table.items-table td:last-child {
                        border-right: none;
                    }
                    table.items-table th {
                        font-size: 10px;
                        font-weight: 800;
                        text-align: center;
                        background: #f8f8f8;
                        border-bottom: 1.5px solid #000;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-left { text-align: left; }
                    .item-row {
                        min-height: 24px;
                    }
                    .total-row td {
                        font-weight: 800;
                        border-top: 1.5px solid #000;
                        background: #fafafa;
                    }
                    .amount-bar {
                        display: flex;
                        border-bottom: 1.5px solid #000;
                    }
                    .amount-cell {
                        flex: 1;
                        padding: 8px 12px;
                        font-size: 11px;
                        font-weight: 700;
                    }
                    .amount-cell:first-child {
                        border-right: 1.5px solid #000;
                    }
                    .terms-box {
                        padding: 8px 12px 14px;
                        font-size: 10px;
                        line-height: 1.4;
                    }
                    .terms-title {
                        font-size: 11px;
                        font-weight: 800;
                        margin-bottom: 4px;
                    }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-gray-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg">
                            🧾
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Tax Invoice #{invoiceNumber}</h2>
                            <p className="text-xs text-gray-500">Order ID: #{order.orderNumber} • Date: {formattedDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
                        >
                            <span>🖨️</span>
                            <span>Print / Save PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Body Container */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex justify-center">
                    <div className="bg-white shadow-md p-6 max-w-[760px] w-full text-black">
                        
                        {/* REF CONTAINER THAT IS PRINTED */}
                        <div ref={printContentRef}>
                            <div className="invoice-container border-[1.5px] border-black text-black">
                                
                                {/* Header: Tax Invoice + Recipient badge */}
                                <div className="header-title-bar flex items-center gap-3 p-2 border-b-[1.5px] border-black">
                                    <span className="tax-invoice-text font-black text-base tracking-wide">TAX INVOICE</span>
                                    <span className="recipient-badge border border-gray-700 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                                        ORIGINAL FOR RECIPIENT
                                    </span>
                                </div>

                                {/* Top Grid: Company Details (Left) + Invoice No & Date (Right) */}
                                <div className="grid-2-col flex border-b-[1.5px] border-black">
                                    {/* Left: Sounkart */}
                                    <div className="col-left flex-[1.25] p-2.5 border-r-[1.5px] border-black">
                                        <h1 className="company-name text-lg font-black tracking-tight leading-none mb-1 text-black">
                                            Sounkart
                                        </h1>
                                        <div className="company-info text-[11px] leading-snug text-gray-900 space-y-0.5">
                                            <p>Kotma road Samatpur Rd, Anuppur, Madhya Pradesh, 484224</p>
                                            <p className="font-medium">
                                                <span className="font-bold">GSTIN:</span> 23DLJPA4954E1ZD &nbsp;&nbsp; 
                                                <span className="font-bold">Mobile:</span> 6260888737
                                            </p>
                                            <p className="font-medium">
                                                <span className="font-bold">PAN Number:</span> DLJPA4954E &nbsp;&nbsp; 
                                                <span className="font-bold">Email:</span> anmolagrahari46@gmail.com
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Invoice No & Date */}
                                    <div className="col-right flex-1 p-2.5 flex flex-col justify-center">
                                        <div className="flex justify-between items-center px-4">
                                            <div className="meta-block text-center">
                                                <p className="meta-label text-[11px] font-bold text-gray-700">Invoice No.</p>
                                                <p className="meta-value text-base font-extrabold text-black">{invoiceNumber}</p>
                                            </div>
                                            <div className="meta-block text-center">
                                                <p className="meta-label text-[11px] font-bold text-gray-700">Invoice Date</p>
                                                <p className="meta-value text-sm font-extrabold text-black">{formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Grid: BILL TO + SHIP TO */}
                                <div className="grid-2-col flex border-b-[1.5px] border-black">
                                    {/* BILL TO */}
                                    <div className="col-left flex-[1.25] p-2.5 border-r-[1.5px] border-black">
                                        <p className="section-title text-[10px] font-bold text-gray-600 uppercase mb-0.5">BILL TO</p>
                                        <p className="customer-name text-[13px] font-extrabold text-black">{customerName}</p>
                                        <div className="customer-info text-[11px] text-gray-900 leading-snug">
                                            {customerAddress && <p>{customerAddress}</p>}
                                            {customerCityState && <p>{customerCityState}</p>}
                                            {customerPhone && <p><span className="font-bold">Mobile:</span> {customerPhone}</p>}
                                            <p><span className="font-bold">Place of Supply:</span> {placeOfSupply}</p>
                                        </div>
                                    </div>

                                    {/* SHIP TO */}
                                    <div className="col-right flex-1 p-2.5">
                                        <p className="section-title text-[10px] font-bold text-gray-600 uppercase mb-0.5">SHIP TO</p>
                                        <p className="customer-name text-[13px] font-extrabold text-black">{customerName}</p>
                                        <div className="customer-info text-[11px] text-gray-900 leading-snug">
                                            {customerAddress && <p>{customerAddress}</p>}
                                            {customerCityState && <p>{customerCityState}</p>}
                                            {customerPhone && <p><span className="font-bold">Mobile:</span> {customerPhone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="items-table w-full border-collapse text-[11px]">
                                    <thead>
                                        <tr className="bg-gray-100 text-black border-b-[1.5px] border-black">
                                            <th className="border-r border-black p-1.5 text-center font-extrabold w-[8%] text-[10px]">S.NO.</th>
                                            <th className="border-r border-black p-1.5 text-left font-extrabold text-[10px]">ITEMS</th>
                                            <th className="border-r border-black p-1.5 text-center font-extrabold w-[12%] text-[10px]">QTY.</th>
                                            <th className="border-r border-black p-1.5 text-right font-extrabold w-[14%] text-[10px]">RATE</th>
                                            <th className="border-r border-black p-1.5 text-right font-extrabold w-[12%] text-[10px]">SGST</th>
                                            <th className="border-r border-black p-1.5 text-right font-extrabold w-[12%] text-[10px]">CGST</th>
                                            <th className="p-1.5 text-right font-extrabold w-[16%] text-[10px]">AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formattedItems.map((item) => (
                                            <tr key={item.sno} className="item-row align-top">
                                                <td className="border-r border-b border-black p-1.5 text-center font-medium">{item.sno}</td>
                                                <td className="border-r border-b border-black p-1.5 text-left font-semibold">{item.title}</td>
                                                <td className="border-r border-b border-black p-1.5 text-center font-medium">{item.qty}</td>
                                                <td className="border-r border-b border-black p-1.5 text-right font-medium">₹{item.rate.toLocaleString('en-IN')}</td>
                                                <td className="border-r border-b border-black p-1.5 text-right font-medium">{item.sgst}</td>
                                                <td className="border-r border-b border-black p-1.5 text-right font-medium">{item.cgst}</td>
                                                <td className="border-b border-black p-1.5 text-right font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}

                                        {/* Blank spacing rows if items count is small to mimic screenshot height */}
                                        {formattedItems.length === 1 && (
                                            <tr className="h-44">
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-r border-b border-black"></td>
                                                <td className="border-b border-black"></td>
                                            </tr>
                                        )}

                                        {/* TOTAL ROW */}
                                        <tr className="total-row font-extrabold bg-gray-50 border-t-[1.5px] border-black">
                                            <td colSpan={2} className="border-r border-b border-black p-1.5 text-right font-extrabold tracking-wide">
                                                TOTAL
                                            </td>
                                            <td className="border-r border-b border-black p-1.5 text-center font-extrabold">
                                                {totalQty}
                                            </td>
                                            <td className="border-r border-b border-black p-1.5"></td>
                                            <td className="border-r border-b border-black p-1.5 text-right font-extrabold">
                                                ₹0.00
                                            </td>
                                            <td className="border-r border-b border-black p-1.5 text-right font-extrabold">
                                                ₹0.00
                                            </td>
                                            <td className="border-b border-black p-1.5 text-right font-extrabold text-sm">
                                                ₹{finalTotalAmount.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Received Amount & Balance Amount Box */}
                                <div className="amount-bar flex border-b-[1.5px] border-black">
                                    <div className="amount-cell flex-1 p-2 border-r-[1.5px] border-black text-xs font-bold">
                                        Received Amount: <span className="font-extrabold">₹ {receivedAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="amount-cell flex-1 p-2 text-xs font-bold">
                                        Balance Amount: <span className="font-extrabold">₹ {balanceAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="terms-box p-2.5 text-[10px] text-gray-800 leading-normal">
                                    <p className="terms-title font-extrabold text-[11px] mb-1 text-black">Terms and Conditions</p>
                                    <p>1. Goods once sold will not be taken back or exchanged</p>
                                    <p>2. All disputes are subject to Anuppur jurisdiction only</p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                    <span>Invoice generated automatically from Sounkart Orders</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderInvoiceModal;
