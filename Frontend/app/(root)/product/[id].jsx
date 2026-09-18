// app/product/[id].jsx
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    // Image,
    Dimensions,
    Pressable,
    FlatList,
    RefreshControl
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AddToCartButton from "@/components/AddToCartButton";
import { getDiscountPercent } from "@/utils/priceUtils";
import { fetchProductById } from "../../../redux/slices/productSlice.js";
import { useDispatch } from "react-redux";
import WishlistButton from "../../../components/WishlistButton.js"
import Header from "../../../components/Header.js";

import { getCurrentScreen, getPreviousScreen, trackEvent, triggerScreenExit } from "../../../utils/eventTracker.js";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
    const dispatch = useDispatch();


    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("Product ID missing hai");
            return;
        }
        fetchProductDetails();
    }, [id]);


    useEffect(() => {
        // let previousScreen = getPreviousScreen()
        // let currentScreen = getCurrentScreen()

        trackEvent({
            eventType: "SCREEN_VIEW",
            screen: "product_detail_page",
            payload: { productId: id, }
            // referrerScreen: previousScreen, // 👈 explicitly bhej diya
        });
    }, []);


    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dispatch(fetchProductById({ id })).unwrap();

            if (result) {
                const fetchedProduct = result?.product;
                setProduct(fetchedProduct);

                const variants = fetchedProduct?.variants || [];
                const defaultVariant =
                    variants.find((v) => v.isDefault) || variants[0] || null;

                setSelectedVariant(defaultVariant);
                setSelectedImageIndex(0);
            } else {
                setError(result.error || "Product not mila");
            }
        } catch (err) {
            // console.log("Error aaya:", err.message);
            if (err.code === "ECONNABORTED") {
                setError("Request timeout ho gaya - server check karo");
            } else if (!err.response) {
                setError("Network error - API URL ya internet check karo");
            } else {
                setError(err?.response?.data?.message || "Kuch gadbad ho gayi");
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchProductDetails();
        } finally {
            setRefreshing(false);
        }
    }, [id]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setSelectedImageIndex(0);
    };

    // if (loading) {
    //     return <ProductDetailsSkeleton />;
    // }

    if (error || !product || !selectedVariant) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-6">
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text className="text-gray-700 mt-3 text-center">{error}</Text>
                <Pressable
                    onPress={fetchProductDetails}
                    className="mt-4 bg-black px-5 py-2.5 rounded-full"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </Pressable>
            </View>
        );
    }

    const variants = product.variants || [];
    const images = selectedVariant.images?.length
        ? selectedVariant.images
        : [{ id: "placeholder", imageUrl: product.imageUrl }];

    const discount = getDiscountPercent(
        selectedVariant.mrp,
        selectedVariant.actualPrice
    );

    // 👇 Buy Now pe checkout screen ko bhejne ke liye pura summary data
    const handleBuyNow = () => {
        trackEvent({
            eventType: "BUY_NOW_BTN_CLICK",
            screen: "product_detail_page",
            payload: {
                productId: product.id, variantId: selectedVariant.id,
            }
        })
        triggerScreenExit()
        router.push({
            pathname: "/(root)/checkout/checkout",
            params: {
                productId: product.id,
                variantId: selectedVariant.id,
                quantity: 1,
                productName: product.productName,
                productImage: images[0]?.imageUrl || product.imageUrl,
                price: selectedVariant.actualPrice,
            },
        });
    };



    return (
        <View className="flex-1 bg-white">
            <Header />

            {(
                loading ? <ProductDetailsSkeleton /> :
                    <>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}

                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
                            }
                        >
                            <WishlistButton productId={product?.id} variantId={selectedVariant?.id} />
                            {/* <Image
                    source={{ uri: images[selectedImageIndex]?.imageUrl }}
                    style={{ width, height: 340 }}
                    resizeMode="cover"
                /> */}

                            <Image
                                source={images[selectedImageIndex]?.imageUrl}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                style={{ width, height: 340 }}
                                resizeMode="cover"
                            />
                            {images.length > 1 && (
                                <FlatList
                                    data={images}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(img) => String(img.id)}
                                    contentContainerStyle={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        gap: 10,
                                    }}
                                    renderItem={({ item: img, index }) => {
                                        const isActive = index === selectedImageIndex;
                                        return (
                                            <Pressable onPress={() => setSelectedImageIndex(index)}>
                                                <View
                                                    className={`rounded-xl overflow-hidden ${isActive ? "border-2 border-black" : "border border-gray-200"
                                                        }`}
                                                >
                                                    {/* <Image
                                            source={{ uri: img.imageUrl }}
                                            style={{ width: 64, height: 64 }}
                                            resizeMode="cover"
                                        /> */}

                                                    <Image
                                                        source={img.imageUrl}
                                                        contentFit="cover"
                                                        cachePolicy="memory-disk"
                                                        style={{ width: 64, height: 64 }}
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                            </Pressable>
                                        );
                                    }}
                                />
                            )}

                            <View className="px-4 pt-2">
                                {product.category && (
                                    <Text className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">
                                        {product.category.productCategoryName}
                                        {product.subCategory
                                            ? ` • ${product.subCategory.productSubCategoryName}`
                                            : ""}
                                    </Text>
                                )}

                                <Text className="text-[19px] font-bold text-gray-900 leading-6">
                                    {product.productName}
                                </Text>

                                <Text className="text-[13px] text-gray-500 mt-1">
                                    {selectedVariant.description}
                                </Text>

                                <View className="flex-row items-center mt-3 flex-wrap gap-2">
                                    <Text className="text-[22px] font-extrabold text-gray-900">
                                        ₹{Number(selectedVariant.actualPrice).toLocaleString("en-IN")}
                                    </Text>

                                    {selectedVariant.showMrp && (
                                        <Text className="text-[14px] text-gray-400 line-through">
                                            ₹{Number(selectedVariant.mrp).toLocaleString("en-IN")}
                                        </Text>
                                    )}

                                    {selectedVariant.showMrp && discount > 0 && (
                                        <View className="bg-green-50 px-2 py-0.5 rounded-md">
                                            <Text className="text-[12px] font-semibold text-green-600">
                                                {discount}% OFF
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text
                                    className={`text-[12px] mt-1 font-medium ${selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"
                                        }`}
                                >
                                    {selectedVariant.stock > 0
                                        ? `In Stock (${selectedVariant.stock} available)`
                                        : "Out of Stock"}
                                </Text>

                                <View className="h-[1px] bg-gray-100 my-4" />

                                {variants.length > 1 && (
                                    <View className="mb-4">
                                        <Text className="text-[13px] font-semibold text-gray-800 mb-2">
                                            Select Variant
                                            {selectedVariant.attributes?.color
                                                ? `: ${selectedVariant.attributes.color}`
                                                : ""}
                                        </Text>

                                        <View className="flex-row flex-wrap gap-2.5">
                                            {variants.map((variant) => {
                                                const isSelected = variant.id === selectedVariant.id;
                                                const thumb =
                                                    variant.images?.[0]?.imageUrl || product.imageUrl;

                                                return (
                                                    <Pressable
                                                        key={variant.id}
                                                        onPress={() => handleVariantSelect(variant)}
                                                        className={`rounded-xl overflow-hidden ${isSelected
                                                            ? "border-2 border-black"
                                                            : "border border-gray-200"
                                                            }`}
                                                    >
                                                        {/* <Image
                                                source={{ uri: thumb }}
                                                style={{ width: 56, height: 56 }}
                                                resizeMode="cover"
                                            /> */}

                                                        <Image
                                                            source={thumb}
                                                            contentFit="cover"
                                                            cachePolicy="memory-disk"
                                                            style={{ width: 56, height: 56 }}
                                                            resizeMode="cover"
                                                        />
                                                        {isSelected && (
                                                            <View className="absolute inset-0 bg-black/10 items-center justify-center">
                                                                <Ionicons
                                                                    name="checkmark-circle"
                                                                    size={18}
                                                                    color="#fff"
                                                                />
                                                            </View>
                                                        )}
                                                    </Pressable>
                                                );
                                            })}
                                        </View>

                                        <View className="flex-row flex-wrap gap-2 mt-2.5">
                                            {variants.map((variant) => {
                                                const isSelected = variant.id === selectedVariant.id;
                                                const label =
                                                    variant.attributes?.color ||
                                                    variant.description ||
                                                    `Variant ${variant.id}`;

                                                return (
                                                    <Pressable
                                                        key={variant.id}
                                                        onPress={() => handleVariantSelect(variant)}
                                                        className={`px-3 py-1.5 rounded-full ${isSelected ? "bg-black" : "bg-gray-100"
                                                            }`}
                                                    >
                                                        <Text
                                                            className={`text-[12px] font-medium ${isSelected ? "text-white" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {label}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                <View className="h-[1px] bg-gray-100 mb-4" />

                                <Text className="text-[13px] font-semibold text-gray-800 mb-1.5">
                                    Product Details
                                </Text>
                                <Text className="text-[13px] text-gray-500 leading-5">
                                    {product.description}
                                </Text>

                                {product.user && (
                                    <View className="flex-row items-center mt-4 mb-24">
                                        <Ionicons name="storefront-outline" size={16} color="#6B7280" />
                                        <Text className="text-[12px] text-gray-500 ml-1.5">
                                            Sold by {product.user.fullName}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View
                            className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 6,
                                elevation: 8,
                            }}
                        >
                            <View className="flex-1 mr-2">
                                <AddToCartButton
                                    productId={product.id}
                                    variantId={selectedVariant.id}
                                    quantity={1}
                                    disabled={selectedVariant.stock === 0}
                                />
                            </View>

                            <Pressable
                                onPress={handleBuyNow}
                                disabled={selectedVariant.stock === 0}
                                className={`flex-1 ml-2 rounded-full py-3 items-center justify-center ${selectedVariant.stock === 0 ? "bg-gray-300" : "bg-black"
                                    }`}
                            >
                                <Text className="text-white font-semibold text-[14px]">Buy Now</Text>
                            </Pressable>
                        </View>
                    </>

            )}
        </View>
    );
}