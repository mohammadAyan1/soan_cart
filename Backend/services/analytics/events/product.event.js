import analyticsService from "../analytics.service.js";

class ProductEvent {

    /**
     * Product Impression
     */
    async trackProductImpression({
        sessionId,
        screen,
        source,
        productId,
        variantId = null,
        position = null
    }) {

        return analyticsService.track({
            eventType: "PRODUCT_IMPRESSION",
            sessionId,
            payload: {
                productId,
                variantId,
                position
            },
            screen,
            source
        });

    }

    /**
     * Product View
     */
    async trackProductView({
        sessionId,
        screen,
        source,
        productId,
        variantId = null
    }) {

        return analyticsService.track({
            eventType: "PRODUCT_VIEW",
            sessionId,
            payload: {
                productId,
                variantId
            },
            screen,
            source
        });

    }

    /**
     * Product Click
     */
    async trackProductClick({
        sessionId,
        screen,
        source,
        productId,
        variantId = null
    }) {

        return analyticsService.track({
            eventType: "PRODUCT_CLICK",
            sessionId,
            payload: {
                productId,
                variantId
            },
            screen,
            source
        });

    }

}

export default new ProductEvent();