

// app/product/[id].jsx
import ProductDetailsSkeleton from "../../../components/ProductDetailsSkeleton.js";
import { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    // Image,
    Dimensions,
    Pressable,
    FlatList,
    RefreshControl,
    Modal,
    StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AddToCartButton from "../../../components/AddToCartButton";
import { getDiscountPercent } from "../../../utils/priceUtils.js";
import { fetchProductById } from "../../../redux/slices/productSlice.js";
import { useDispatch } from "react-redux";
import WishlistButton from "../../../components/WishlistButton.js"
import Header from "../../../components/Header.js";

import { trackEvent, triggerScreenExit } from "../../../utils/eventTracker.js";

const { width, height } = Dimensions.get("window");

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

    // 👇 NAYA — full-screen image viewer ke liye
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const viewerListRef = useRef(null);

    // 👇 NAYA — main (bada) image area ko khud swipeable banane ke liye
    const mainImageListRef = useRef(null);

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

    // 👇 UPDATED — variant badalne pe selectedImageIndex reset hota hai,
    // toh main image FlatList ko bhi wapas pehli image pe (bina animation) le jao
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setSelectedImageIndex(0);
        requestAnimationFrame(() => {
            mainImageListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
    };

    // 👇 NAYA — thumbnail tap karne pe main (bada) image area bhi
    // usi image pe slide ho jaye (dono taraf se sync)
    const handleThumbnailSelect = (index) => {
        setSelectedImageIndex(index);
        mainImageListRef.current?.scrollToIndex({ index, animated: true });
    };

    // 👇 NAYA — user jab main image ko khud swipe kare, tab selectedImageIndex
    // (aur isliye active thumbnail border) automatically update ho
    const handleMainImageScrollEnd = (e) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        setSelectedImageIndex(newIndex);
    };

    // 👇 NAYA — main image ya thumbnail pe tap karke full-screen viewer kholna
    const openImageViewer = (index) => {
        setViewerIndex(index);
        setIsImageViewerVisible(true);
    };

    // 👇 NAYA — viewer band karte waqt jo image dikh rahi thi wahi
    // thumbnail strip aur main image area me bhi select ho jaye (sync)
    const closeImageViewer = () => {
        setSelectedImageIndex(viewerIndex);
        mainImageListRef.current?.scrollToIndex({ index: viewerIndex, animated: false });
        setIsImageViewerVisible(false);
    };

    // 👇 NAYA — viewer ke andar swipe karne pe current index track karna
    const handleViewerScrollEnd = (e) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        setViewerIndex(newIndex);
    };

    // 👇 FIX: pehle ye check loading ka wait kiye bina hi chal jaata tha,
    // isliye skeleton kabhi dikhta hi nahi tha (product/selectedVariant
    // initial me null hote hain jab tak fetch complete nahi hota).
    // Ab "!loading" add kiya hai taaki jab tak loading true hai,
    // error/retry UI skip ho aur neeche wala skeleton render ho.
    if (!loading && (error || !product || !selectedVariant)) {
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

    // 👇 Loading ke dauraan product/selectedVariant null hi honge,
    // isliye skeleton yahan return kar dete hain — neeche wala JSX
    // (jisko product/selectedVariant chahiye) tabhi chalega jab loading false ho.
    if (loading) {
        return (
            <View className="flex-1 bg-white">
                <Header />
                <ProductDetailsSkeleton />
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

                {/* 👇 UPDATED — ab ye ek single Image nahi, balki ek horizontal
                    pagingEnabled FlatList hai, taaki bina full-screen khole hi
                    bade image area ko seedha swipe kiya ja sake. Tap karne pe
                    full-screen viewer bhi khulta hai. */}
                <FlatList
                    ref={mainImageListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(img) => `main-${img.id}`}
                    initialScrollIndex={selectedImageIndex}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onMomentumScrollEnd={handleMainImageScrollEnd}
                    renderItem={({ item: img, index }) => (
                        <Pressable onPress={() => openImageViewer(index)}>
                            <Image
                                source={img.imageUrl}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                style={{ width, height: 340 }}
                                resizeMode="cover"
                            />
                        </Pressable>
                    )}
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
                                <Pressable
                                    onPress={() => handleThumbnailSelect(index)}
                                    onLongPress={() => openImageViewer(index)}
                                >
                                    <View
                                        className={`rounded-xl overflow-hidden ${isActive ? "border-2 border-green-600" : "border border-gray-200"
                                            }`}
                                    >
                                        {/* 👆 UPDATED — active thumbnail ka border ab distinct
                                            green color ka hai (pehle black tha), taaki user ko
                                            saaf dikhe ki wo kaunsi image pe pahuncha hai */}
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
                className="flex-row items-center px-4 py-3 pb-8 bg-white border-t border-gray-100"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 8,
                }}
            >
                <View className="flex-1 mr-2  ">
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
                    className={`flex-1 ml-2 mt-2.5 rounded-xl py-2.5 items-center justify-center ${selectedVariant.stock === 0 ? "bg-gray-300" : "bg-black"
                        }`}
                >
                    <Text className="text-white font-semibold text-[14px]">Buy Now</Text>
                </Pressable>
            </View>

            {/* 👇 Full-screen swipeable image viewer Modal */}
            <Modal
                visible={isImageViewerVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={closeImageViewer}
            >
                <StatusBar hidden={true} />
                <View className="flex-1 bg-black">
                    {/* Close button */}
                    <Pressable
                        onPress={closeImageViewer}
                        className="absolute top-14 right-4 z-10 bg-white/20 rounded-full p-2"
                    >
                        <Ionicons name="close" size={26} color="#fff" />
                    </Pressable>

                    {/* Counter, e.g. "2 / 5" */}
                    {images.length > 1 && (
                        <View className="absolute top-14 left-4 z-10 bg-white/20 rounded-full px-3 py-1.5">
                            <Text className="text-white text-[13px] font-medium">
                                {viewerIndex + 1} / {images.length}
                            </Text>
                        </View>
                    )}

                    <FlatList
                        ref={viewerListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(img) => `viewer-${img.id}`}
                        initialScrollIndex={viewerIndex}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        onMomentumScrollEnd={handleViewerScrollEnd}
                        renderItem={({ item: img }) => (
                            <View style={{ width, height }} className="items-center justify-center">
                                <Image
                                    source={img.imageUrl}
                                    contentFit="contain"
                                    cachePolicy="memory-disk"
                                    style={{ width, height }}
                                />
                            </View>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}