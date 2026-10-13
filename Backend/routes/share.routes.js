import express from "express";
import prisma from "../config/prisma.js";

const shareRoutes = express.Router();

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==================================================================
// 1. Android App Links Verification (Domain Renew hone par kaam aayega)
// ==================================================================
shareRoutes.get("/.well-known/assetlinks.json", (req, res) => {
    const rawFingerprints = process.env.ANDROID_SHA256_FINGERPRINTS || "";
    const fingerprints = rawFingerprints
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

    // Default fallback fingerprint ya env variable se
    const finalFingerprints = fingerprints.length > 0 
        ? fingerprints 
        : ["00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"];

    res.setHeader("Content-Type", "application/json");
    res.json([
        {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.mohammadayan.Sounkart",
                sha256_cert_fingerprints: finalFingerprints
            }
        }
    ]);
});

// ==================================================================
// 2. Product Share Landing Page (Mobile web landing page + auto open app)
// ==================================================================
shareRoutes.get("/product/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!productId || isNaN(productId)) {
            return res.status(400).send("Invalid product ID");
        }

        const product = await prisma.product.findFirst({
            where: { id: productId, isDelete: false },
            include: {
                category: true,
                variants: {
                    where: { isDelete: false },
                    include: { images: true }
                }
            }
        });

        if (!product) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Product Not Found - Sounkart</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; color: #1e293b; }
                        .card { background: white; padding: 40px 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 380px; width: 90%; }
                        h2 { margin: 0 0 10px; font-size: 22px; color: #0f172a; }
                        p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
                        a { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Product Not Found</h2>
                        <p>This product may have been removed or is no longer available.</p>
                        <a href="https://play.google.com/store/apps/details?id=com.mohammadayan.Sounkart">Open Sounkart App</a>
                    </div>
                </body>
                </html>
            `);
        }

        // Active variant selection
        const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0] || {};
        const price = defaultVariant.actualPrice ?? 0;
        const mrp = defaultVariant.mrp ?? 0;
        const discountPercent = mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

        // Image selection
        let imageUrl = product.imageUrl;
        if (!imageUrl && defaultVariant.images && defaultVariant.images.length > 0) {
            imageUrl = defaultVariant.images[0].imageUrl;
        }
        if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
        }

        const title = product.productName || "Product on Sounkart";
        const description = (product.description || `Buy ${title} at the best price on Sounkart. Free Delivery & Easy Returns!`)
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);

        const currentHost = req.get("host") || "sounkart.in";
        const protocol = req.protocol || "https";
        const pageUrl = `${protocol}://${currentHost}/product/${productId}`;
        const playStoreUrl = "https://play.google.com/store/apps/details?id=com.mohammadayan.Sounkart";

        // Custom scheme & Android Intent link
        const customSchemeUrl = `sounkart://product/${productId}`;
        const androidIntentUrl = `intent://product/${productId}#Intent;scheme=sounkart;package=com.mohammadayan.Sounkart;end`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${escapeHtml(title)} - Sounkart</title>

    <!-- Open Graph / WhatsApp Preview Meta Tags -->
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Sounkart" />
    <meta property="og:title" content="${escapeHtml(title)} - ₹${price}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${pageUrl}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)} - ₹${price}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />

    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        body { background-color: #f1f5f9; color: #0f172a; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 16px; }
        .container { width: 100%; max-width: 440px; margin: auto; }
        .brand-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 6px 18px; }
        .logo-area { display: flex; align-items: center; gap: 8px; }
        .logo-text { font-size: 22px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px; }
        .app-badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 999px; text-transform: uppercase; }

        .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
        .image-wrapper { position: relative; width: 100%; aspect-ratio: 1/1; background-color: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .image-wrapper img { width: 100%; height: 100%; object-fit: contain; }
        .discount-tag { position: absolute; top: 12px; left: 12px; background: #dc2626; color: white; font-weight: 800; font-size: 12px; padding: 5px 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }

        .details { padding: 20px; }
        .category-name { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .product-title { font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 12px; }

        .pricing { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
        .price { font-size: 26px; font-weight: 800; color: #16a34a; }
        .mrp { font-size: 16px; color: #94a3b8; text-decoration: line-through; }
        .save-badge { font-size: 12px; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 2px 8px; border-radius: 6px; border: 1px solid #bbf7d0; }

        .desc { font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 22px; max-height: 72px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

        .cta-group { display: flex; flex-direction: column; gap: 10px; }
        .btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #16a34a; color: #ffffff; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; text-align: center; border: none; cursor: pointer; transition: transform 0.15s ease, background-color 0.15s ease; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35); }
        .btn-primary:active { transform: scale(0.98); background: #15803d; }
        .btn-secondary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #ffffff; color: #0f172a; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; border: 1.5px solid #cbd5e1; cursor: pointer; }
        .btn-secondary:active { background: #f8fafc; }

        .features-footer { display: flex; justify-content: space-around; padding: 18px 8px; text-align: center; color: #64748b; font-size: 11px; font-weight: 600; }
        .features-footer div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .feature-icon { font-size: 16px; }

        /* Banner notice */
        .redirect-notice { font-size: 12px; text-align: center; color: #64748b; margin-top: 10px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand-header">
            <div class="logo-area">
                <span class="logo-text">Sounkart</span>
                <span class="app-badge">Official</span>
            </div>
            <a href="${playStoreUrl}" style="font-size: 12px; color: #16a34a; text-decoration: none; font-weight: 600;">Get App</a>
        </div>

        <div class="card">
            <div class="image-wrapper">
                <img src="${imageUrl}" alt="${escapeHtml(title)}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'" />
                ${discountPercent > 0 ? `<div class="discount-tag">${discountPercent}% OFF</div>` : ""}
            </div>

            <div class="details">
                <div class="category-name">${escapeHtml(product.category?.name || "Product")}</div>
                <h1 class="product-title">${escapeHtml(title)}</h1>

                <div class="pricing">
                    <span class="price">₹${price}</span>
                    ${mrp > price ? `<span class="mrp">₹${mrp}</span>` : ""}
                    ${discountPercent > 0 ? `<span class="save-badge">Save ${discountPercent}%</span>` : ""}
                </div>

                <p class="desc">${escapeHtml(description)}</p>

                <div class="cta-group">
                    <a id="openAppBtn" href="${customSchemeUrl}" class="btn-primary" onclick="handleOpenApp(event)">
                        ⚡ Open in Sounkart App
                    </a>
                    <a href="${playStoreUrl}" class="btn-secondary">
                        🛍️ Get App on Google Play
                    </a>
                </div>

                <p class="redirect-notice" id="redirectNotice">Redirecting to Sounkart App...</p>
            </div>
        </div>

        <div class="features-footer">
            <div><span class="feature-icon">🚚</span>Fast Delivery</div>
            <div><span class="feature-icon">💯</span>Original Products</div>
            <div><span class="feature-icon">🛡️</span>Secure Payment</div>
        </div>
    </div>

    <script>
        const productId = "${productId}";
        const customSchemeUrl = "${customSchemeUrl}";
        const androidIntentUrl = "${androidIntentUrl}";
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        function handleOpenApp(e) {
            if (isAndroid) {
                if (e) e.preventDefault();
                window.location.href = androidIntentUrl;
            } else if (isIOS) {
                if (e) e.preventDefault();
                window.location.href = customSchemeUrl;
            }
        }

        // Auto redirect if user opened via mobile browser
        window.addEventListener("DOMContentLoaded", () => {
            if (isAndroid || isIOS) {
                setTimeout(() => {
                    handleOpenApp();
                }, 400);

                setTimeout(() => {
                    const notice = document.getElementById("redirectNotice");
                    if (notice) {
                        notice.textContent = "Tap 'Open in Sounkart App' if app didn't launch automatically.";
                    }
                }, 2500);
            } else {
                const notice = document.getElementById("redirectNotice");
                if (notice) notice.style.display = "none";
            }
        });
    </script>
</body>
</html>
        `;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(html);
    } catch (error) {
        console.error("Share product route error:", error);
        return res.status(500).send("Something went wrong");
    }
});

export default shareRoutes;
