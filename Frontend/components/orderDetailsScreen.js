// import React, { useState, useCallback, useEffect } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     FlatList,
//     TouchableOpacity,
//     StyleSheet,
//     Alert,
//     ActivityIndicator,
//     RefreshControl,
//     Platform,
//     // Image,
//     LayoutAnimation,
//     UIManager
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system/legacy';
// import * as MediaLibrary from 'expo-media-library';
// import Constants from 'expo-constants';
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchMyOrdersById } from "../redux/slices/orderSlice";
// import { Image } from "expo-image";

// import { useSafeAreaInsets } from "react-native-safe-area-context";

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const isExpoGo = Constants.appOwnership === 'expo';

// // ---------- Design tokens ----------
// const COLORS = {
//     primary: '#16A34A',
//     primaryDark: '#15803D',
//     primaryLight: '#DCFCE7',
//     bg: '#F4F6F8',
//     card: '#FFFFFF',
//     border: '#EEF1F4',
//     textDark: '#1A1D23',
//     textMuted: '#6B7280',
//     textLight: '#9CA3AF',
//     danger: '#DC2626',
//     warning: '#D97706',
//     warningBg: '#FEF3C7',
// };

// // Delivery status -> color + icon mapping
// const STATUS_META = {
//     PENDING: { color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' },
//     CONFIRMED: { color: '#2563EB', bg: '#DBEAFE', icon: 'checkmark-circle-outline' },
//     PROCESSING: { color: '#7C3AED', bg: '#EDE9FE', icon: 'sync-outline' },
//     SHIPPED: { color: '#0891B2', bg: '#CFFAFE', icon: 'cube-outline' },
//     OUT_FOR_DELIVERY: { color: '#EA580C', bg: '#FFEDD5', icon: 'bicycle-outline' },
//     DELIVERED: { color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-done-circle-outline' },
//     CANCELLED: { color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle-outline' },
//     RETURNED: { color: '#6B7280', bg: '#F3F4F6', icon: 'arrow-undo-outline' },
//     DEFAULT: { color: '#6B7280', bg: '#F3F4F6', icon: 'ellipse-outline' },
// };
// const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.DEFAULT;

// // Stage ranking — jitna aage stage utna zyada rank (progression check ke liye)
// const STAGE_RANK = {
//     PENDING: 0,
//     CONFIRMED: 1,
//     PROCESSING: 2,
//     SHIPPED: 3,
//     OUT_FOR_DELIVERY: 4,
//     DELIVERED: 5,
// };

// /**
//  * Overall order status calculate karne ka logic:
//  * 1. Agar koi bhi item CANCELLED nahi hai in active items me se, to unhe consider karo.
//  *    Agar SAARE items hi cancelled hain -> order CANCELLED dikhao.
//  * 2. Agar kam se kam EK item DELIVERED ya RETURNED hai (returned matlab pehle deliver ho chuka tha)
//  *    -> order ko DELIVERED dikhao (chahe baaki items abhi processing/pending/return ho).
//  * 3. Warna, agar kam se kam EK item PROCESSING ya usse aage (SHIPPED/OUT_FOR_DELIVERY/CONFIRMED) hai
//  *    -> order ko PROCESSING dikhao.
//  * 4. Warna (koi bhi item processing tak nahi pahuncha) -> order ko PENDING dikhao.
//  */
// const getOverallOrderStatus = (items) => {
//     if (!items || items.length === 0) return 'PENDING';

//     const activeItems = items.filter((i) => i.deliveryStatus !== 'CANCELLED');
//     if (activeItems.length === 0) return 'CANCELLED';

//     const anyDeliveredOrReturned = activeItems.some(
//         (i) => i.deliveryStatus === 'DELIVERED' || i.deliveryStatus === 'RETURNED'
//     );
//     if (anyDeliveredOrReturned) return 'DELIVERED';

//     const anyProcessingOrBeyond = activeItems.some(
//         (i) => (STAGE_RANK[i.deliveryStatus] ?? 0) >= STAGE_RANK.PROCESSING
//     );
//     if (anyProcessingOrBeyond) return 'PROCESSING';

//     return 'PENDING';
// };

// const OrderDetailScreen = () => {
//     const insets = useSafeAreaInsets();

//     const { id } = useLocalSearchParams();
//     const dispatch = useDispatch();
//     const router = useRouter();

//     const { orderData, ordersLoading, ordersError } = useSelector((state) => state.order);

//     const [refreshing, setRefreshing] = useState(false);
//     const [pdfLoading, setPdfLoading] = useState(false);
//     const [expandedItemId, setExpandedItemId] = useState(null);

//     useEffect(() => {
//         if (id) {
//             dispatch(fetchMyOrdersById(id));
//         }
//     }, [id]);

//     const onRefresh = useCallback(async () => {
//         setRefreshing(true);
//         await dispatch(fetchMyOrdersById(id));
//         setRefreshing(false);
//     }, [id]);

//     // ---------- Safe data extraction ----------
//     const order = orderData || {};
//     const items = order?.items || [];
//     const overallStatus = getOverallOrderStatus(items);
//     const overallMeta = getStatusMeta(overallStatus);

//     // ---------- Navigate to product/variant page on item click ----------
//     const goToProduct = (item) => {
//         const productId = item?.product?.id;
//         const variantId = item?.variant?.id;
//         if (!productId || !variantId) return;
//         router.push(`/product/${productId}/${variantId}`);
//     };

//     // ---------- Expand/collapse per-item timeline ----------
//     const toggleItemTimeline = (itemId) => {
//         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         setExpandedItemId((prev) => (prev === itemId ? null : itemId));
//     };

//     // ---------- PDF Generation + Download ----------
//     const generateInvoicePDF = async () => {
//         if (!order.orderNumber) {
//             Alert.alert('Error', 'Order data is incomplete.');
//             return;
//         }

//         setPdfLoading(true);
//         try {
//             const itemsRows = items.map((item, index) => {
//                 const attrs = item.variant?.attributes || {};
//                 const attrStr = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
//                 return `
//                     <tr>
//                         <td>${index + 1}</td>
//                         <td>${item.product?.productName || 'N/A'}</td>
//                         <td>${attrStr || '-'}</td>
//                         <td>${item.quantity || 0}</td>
//                         <td>₹${item.price || '0'}</td>
//                         <td>₹${(parseInt(item.price) || 0) * (item.quantity || 0)}</td>
//                         <td>${item.deliveryStatus || 'N/A'}</td>
//                     </tr>
//                 `;
//             }).join('');

//             // Har item ka apna alag timeline section PDF me
//             const perItemTimelineSections = items.map((item, index) => {

//                 const history = item.statusHistory || [];
//                 const rows = history.map(entry => `
//                     <tr>
//                         <td>${entry.status || ''}</td>
//                         <td>${entry.note || ''}</td>
//                         <td>${entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</td>
//                     </tr>
//                 `).join('');
//                 return `
//                     <h4>${index + 1}. 
//   ${item.product?.productName || 'Item'}
//   ${item?.variant?.description ? ` (${item.variant.description})` : ''}
// </h4>
//                     <table class="status-history-table">
//                         <thead><tr><th>Status</th><th>Note</th><th>Date</th></tr></thead>
//                         <tbody>${rows || '<tr><td colspan="3">No history available</td></tr>'}</tbody>
//                     </table>
//                 `;
//             }).join('');

//             const htmlContent = `
//                 <html>
//                 <head>
//                     <style>
//                         body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
//                         .header { text-align: center; border-bottom: 2px solid #16A34A; padding-bottom: 10px; }
//                         .header h1 { margin: 0; color: #16A34A; }
//                         .order-info { margin: 20px 0; }
//                         .order-info table { width: 100%; }
//                         .order-info td { padding: 5px; }
//                         .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//                         .items-table th { background: #16A34A; color: white; padding: 10px; text-align: left; }
//                         .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
//                         .total-row { font-weight: bold; }
//                         .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 12px; color: #888; }
//                         .status-history-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
//                         .status-history-table th { background: #f2f2f2; padding: 8px; text-align: left; }
//                         .status-history-table td { padding: 8px; border-bottom: 1px solid #eee; }
//                         h4 { margin-bottom: 6px; color: #1A1D23; }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="header">
//                         <h1>INVOICE</h1>
//                         <p>Order #${order.orderNumber || ''}</p>
//                     </div>

//                     <div class="order-info">
//                         <table>
//                             <tr><td><strong>Order Date:</strong></td><td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td></tr>
//                             <tr><td><strong>Customer:</strong></td><td>${order.fullName || ''}</td></tr>
//                             <tr><td><strong>Phone:</strong></td><td>${order.phone || ''}</td></tr>
//                             <tr><td><strong>Address:</strong></td><td>${order.addressLine || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}</td></tr>
//                             <tr><td><strong>Payment:</strong></td><td>${order.orderType || ''} (${order.paymentStatus || ''})</td></tr>
//                             <tr><td><strong>Order Status:</strong></td><td>${overallStatus}</td></tr>
//                             <tr><td><strong>Total Amount:</strong></td><td>₹${order.totalAmount || '0'}</td></tr>
//                         </table>
//                     </div>

//                     <h3>Order Items</h3>
//                     <table class="items-table">
//                         <thead>
//                             <tr><th>#</th><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr>
//                         </thead>
//                         <tbody>
//                             ${itemsRows}
//                             <tr class="total-row">
//                                 <td colspan="5" style="text-align:right;">Grand Total</td>
//                                 <td colspan="2">₹${order.totalAmount || '0'}</td>
//                             </tr>
//                         </tbody>
//                     </table>

//                     <h3>Item-wise Timeline</h3>
//                     ${perItemTimelineSections}

//                     <div class="footer">
//                         <p>Thank you for your order! This is a system-generated invoice.</p>
//                     </div>
//                 </body>
//                 </html>
//             `;

//             const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

//             const fileName = `Invoice_${order.orderNumber}.pdf`;
//             const newUri = `${FileSystem.documentDirectory}${fileName}`;
//             await FileSystem.copyAsync({ from: uri, to: newUri });

//             if (Platform.OS === 'android' && !isExpoGo) {
//                 const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
//                 if (status === 'granted') {
//                     const asset = await MediaLibrary.createAssetAsync(newUri);
//                     await MediaLibrary.createAlbumAsync('Download', asset, false);
//                     Alert.alert('Success', `Invoice download ho gaya: ${fileName}`);
//                 } else {
//                     Alert.alert('Permission Required', 'Storage permission nahi mili. Share screen se PDF save/share kar sakte hain.');
//                     if (await Sharing.isAvailableAsync()) {
//                         await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', dialogTitle: `Invoice #${order.orderNumber}` });
//                     }
//                 }
//             } else if (Platform.OS === 'android' && isExpoGo) {
//                 if (await Sharing.isAvailableAsync()) {
//                     await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', dialogTitle: `Invoice #${order.orderNumber}` });
//                 } else {
//                     Alert.alert('PDF generated', `File saved at: ${newUri}`);
//                 }
//             } else {
//                 if (await Sharing.isAvailableAsync()) {
//                     await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `Invoice #${order.orderNumber}` });
//                 } else {
//                     Alert.alert('PDF generated', `File saved at: ${newUri}`);
//                 }
//             }
//         } catch (error) {
//             console.error(error);
//             Alert.alert('Error', 'Failed to generate invoice.');
//         } finally {
//             setPdfLoading(false);
//         }
//     };

//     // ---------- Render Item Card (with click-to-navigate + own timeline) ----------
//     const renderItem = ({ item, index }) => {
//         const attributes = item.variant?.attributes || {};
//         const attrString = Object.entries(attributes).map(([k, v]) => `${v}`).join(' • ');
//         const meta = getStatusMeta(item.deliveryStatus);
//         const lineTotal = (parseInt(item.price) || 0) * (item.quantity || 0);
//         const itemKey = item.id?.toString() || index.toString();
//         const isExpanded = expandedItemId === itemKey;
//         const itemHistory = item.statusHistory || [];

//         return (
//             <View style={[styles.itemWrapper, index !== items.length - 1 && styles.itemCardDivider]}>
//                 <TouchableOpacity
//                     style={styles.itemCard}
//                     activeOpacity={0.7}
//                     onPress={() => goToProduct(item)}
//                 >
//                     {/* <Image
//                         source={{ uri: item?.variant?.images?.[0]?.imageUrl || item.product?.imageUrl }}
//                         style={styles.itemImage}
//                         resizeMode="cover"
//                     /> */}

//                     <Image
//                         source={item?.variant?.images?.[0]?.imageUrl || item.product?.imageUrl}
//                         contentFit="cover"
//                         cachePolicy="memory-disk"
//                         style={styles.itemImage}
//                         resizeMode="cover"
//                     />
//                     <View style={styles.itemInfo}>
//                         <Text style={styles.itemName} numberOfLines={2}>
//                             {item.product?.productName || 'Unknown Product'}
//                         </Text>
//                         {!!attrString && (
//                             <Text style={styles.itemVariant} numberOfLines={1}>{attrString}</Text>
//                         )}

//                         <View style={styles.itemMetaRow}>
//                             <Text style={styles.itemQtyPrice}>
//                                 Qty {item.quantity || 0}  ·  ₹{item.price || '0'}
//                             </Text>
//                             <Text style={styles.itemLineTotal}>₹{lineTotal}</Text>
//                         </View>

//                         <View style={styles.itemFooterRow}>
//                             <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
//                                 <Ionicons name={meta.icon} size={12} color={meta.color} />
//                                 <Text style={[styles.statusPillText, { color: meta.color }]}>
//                                     {(item.deliveryStatus || 'N/A').replace(/_/g, ' ')}
//                                 </Text>
//                             </View>

//                             <TouchableOpacity
//                                 style={styles.trackButton}
//                                 onPress={() => toggleItemTimeline(itemKey)}
//                                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                             >
//                                 <Text style={styles.trackButtonText}>
//                                     {isExpanded ? 'Hide Tracking' : 'Track Item'}
//                                 </Text>
//                                 <Ionicons
//                                     name={isExpanded ? 'chevron-up' : 'chevron-down'}
//                                     size={14}
//                                     color={COLORS.primary}
//                                 />
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                     <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ alignSelf: 'center' }} />
//                 </TouchableOpacity>

//                 {/* Per-item timeline */}
//                 {isExpanded && (
//                     <View style={styles.itemTimelineBox}>
//                         {itemHistory.length === 0 ? (
//                             <Text style={styles.emptyText}>No tracking updates for this item yet.</Text>
//                         ) : (
//                             itemHistory.map((entry, idx) => {
//                                 const entryMeta = getStatusMeta(entry.status);
//                                 const isLast = idx === itemHistory.length - 1;
//                                 return (
//                                     <View key={idx} style={styles.timelineItem}>
//                                         <View style={styles.timelineDotCol}>
//                                             <View style={[styles.timelineDot, { backgroundColor: entryMeta.color }]}>
//                                                 <Ionicons name={entryMeta.icon} size={10} color="#fff" />
//                                             </View>
//                                             {!isLast && <View style={styles.timelineLine} />}
//                                         </View>
//                                         <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
//                                             <Text style={styles.timelineStatus}>
//                                                 {(entry.status || '').replace(/_/g, ' ')}
//                                             </Text>
//                                             {!!entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
//                                             <Text style={styles.timelineDate}>
//                                                 {entry.changedAt ? new Date(entry.changedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
//                                             </Text>
//                                         </View>
//                                     </View>
//                                 );
//                             })
//                         )}
//                     </View>
//                 )}
//             </View>
//         );
//     };

//     // ---------- Loading / Error / Empty States ----------
//     if (ordersLoading && !orderData) {
//         return (
//             <View style={styles.centered}>
//                 <ActivityIndicator size="large" color={COLORS.primary} />
//                 <Text style={styles.loadingText}>Loading order details...</Text>
//             </View>
//         );
//     }

//     if (ordersError) {
//         return (
//             <View style={styles.centered}>
//                 <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
//                 <Text style={styles.errorText}>{ordersError}</Text>
//                 <TouchableOpacity onPress={onRefresh} style={styles.retryButton} activeOpacity={0.85}>
//                     <Text style={styles.retryButtonText}>Retry</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     if (!order || Object.keys(order).length === 0) {
//         return (
//             <View style={styles.centered}>
//                 <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
//                 <Text style={styles.emptyText}>No order data available.</Text>
//             </View>
//         );
//     }

//     const paymentMeta = order.paymentStatus === 'PAID'
//         ? { color: COLORS.primary, bg: COLORS.primaryLight }
//         : { color: COLORS.warning, bg: COLORS.warningBg };

//     // ---------- Main UI ----------
//     return (
//         <ScrollView
//             style={styles.container}
//             contentContainerStyle={styles.containerContent}
//             showsVerticalScrollIndicator={false}
//             refreshControl={
//                 <RefreshControl
//                     refreshing={refreshing}
//                     onRefresh={onRefresh}
//                     colors={[COLORS.primary]}
//                     tintColor={COLORS.primary}
//                 />
//             }
//         >

//             <View style={{ height: insets.top + 0 }} />

//             {/* Order Header */}
//             <View style={styles.headerCard}>
//                 <View style={styles.headerTopRow}>
//                     <View style={[styles.headerIconWrap, { backgroundColor: overallMeta.bg }]}>
//                         <Ionicons name={overallMeta.icon} size={22} color={overallMeta.color} />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                         <Text style={styles.orderNumber}>Order #{order.orderNumber || ''}</Text>
//                         <Text style={styles.orderDate}>
//                             {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
//                         </Text>
//                     </View>
//                     <View style={[styles.orderStatusBadge, { backgroundColor: overallMeta.bg }]}>
//                         <Text style={[styles.orderStatusText, { color: overallMeta.color }]}>
//                             {overallStatus.replace(/_/g, ' ')}
//                         </Text>
//                     </View>
//                 </View>

//                 <View style={styles.headerDivider} />

//                 <View style={styles.headerBottomRow}>
//                     <View>
//                         <Text style={styles.totalLabel}>Total Amount</Text>
//                         <Text style={styles.orderTotal}>₹{order.totalAmount || '0'}</Text>
//                     </View>
//                     <View style={styles.paymentBadgesWrap}>
//                         <View style={[styles.paymentStatusBadge, { backgroundColor: paymentMeta.bg }]}>
//                             <Text style={[styles.paymentStatusText, { color: paymentMeta.color }]}>
//                                 {order.paymentStatus || 'PENDING'}
//                             </Text>
//                         </View>
//                         <Text style={styles.orderPaymentType}>{order.orderType || ''}</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Address */}
//             <View style={styles.section}>
//                 <View style={styles.sectionHeaderRow}>
//                     <Ionicons name="location-outline" size={18} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Shipping Address</Text>
//                 </View>
//                 <Text style={styles.addressName}>{order.fullName || ''}</Text>
//                 <Text style={styles.addressLine}>{order.addressLine || ''}</Text>
//                 <Text style={styles.addressLine}>
//                     {order.city || ''}{order.city ? ', ' : ''}{order.state || ''} {order.pincode ? `- ${order.pincode}` : ''}
//                 </Text>
//                 <View style={styles.phoneRow}>
//                     <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
//                     <Text style={styles.phoneText}>{order.phone || ''}</Text>
//                 </View>
//             </View>

//             {/* Items — click to open product, tap "Track Item" to see that item's own timeline */}
//             <View style={[styles.section, { padding: 0, overflow: 'hidden' }]}>
//                 <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16, paddingTop: 16 }]}>
//                     <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Items ({items.length})</Text>
//                 </View>
//                 {items.length === 0 ? (
//                     <Text style={[styles.emptyText, { padding: 16 }]}>No items found.</Text>
//                 ) : (
//                     <FlatList
//                         data={items}
//                         renderItem={renderItem}
//                         keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//                         scrollEnabled={false}
//                     />
//                 )}
//             </View>

//             {/* Download Button */}
//             <TouchableOpacity
//                 style={[styles.downloadButton, pdfLoading && styles.downloadButtonDisabled]}
//                 onPress={generateInvoicePDF}
//                 disabled={pdfLoading}
//                 activeOpacity={0.85}
//             >
//                 {pdfLoading ? (
//                     <ActivityIndicator color="#fff" />
//                 ) : (
//                     <>
//                         <Ionicons name="download-outline" size={19} color="#fff" />
//                         <Text style={styles.downloadButtonText}>Download Invoice</Text>
//                     </>
//                 )}
//             </TouchableOpacity>

//             <View style={{ height: 30 }} />
//         </ScrollView>
//     );
// };

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: COLORS.bg },
//     containerContent: { padding: 16 },

//     centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.bg },
//     loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },
//     errorText: { color: COLORS.danger, fontSize: 15, textAlign: 'center', marginTop: 12 },
//     emptyText: { color: COLORS.textLight, fontSize: 14, textAlign: 'center' },
//     retryButton: {
//         marginTop: 18,
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 28,
//         paddingVertical: 11,
//         borderRadius: 10,
//     },
//     retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

//     // Header
//     headerCard: {
//         backgroundColor: COLORS.card,
//         padding: 18,
//         borderRadius: 16,
//         marginBottom: 14,
//         shadowColor: '#000',
//         shadowOpacity: 0.06,
//         shadowOffset: { width: 0, height: 2 },
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//     headerIconWrap: {
//         width: 42,
//         height: 42,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     orderNumber: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
//     orderDate: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 },
//     orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
//     orderStatusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
//     headerDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
//     headerBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
//     totalLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
//     orderTotal: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
//     paymentBadgesWrap: { alignItems: 'flex-end', gap: 6 },
//     paymentStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//     paymentStatusText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3 },
//     orderPaymentType: { fontSize: 12, color: COLORS.textMuted },

//     // Section
//     section: {
//         backgroundColor: COLORS.card,
//         padding: 16,
//         borderRadius: 16,
//         marginBottom: 14,
//         shadowColor: '#000',
//         shadowOpacity: 0.04,
//         shadowOffset: { width: 0, height: 1 },
//         shadowRadius: 6,
//         elevation: 2,
//     },
//     sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
//     sectionTitle: { fontSize: 15.5, fontWeight: '700', color: COLORS.textDark },

//     // Address
//     addressName: { fontWeight: '700', fontSize: 14.5, color: COLORS.textDark, marginBottom: 4 },
//     addressLine: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 20 },
//     phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
//     phoneText: { fontSize: 13.5, color: COLORS.textMuted },

//     // Item card
//     itemWrapper: { paddingHorizontal: 0 },
//     itemCardDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
//     itemCard: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
//     itemImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: COLORS.bg },
//     itemInfo: { flex: 1, justifyContent: 'center', gap: 4 },
//     itemName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
//     itemVariant: { fontSize: 12.5, color: COLORS.textMuted },
//     itemMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
//     itemQtyPrice: { fontSize: 12.5, color: COLORS.textMuted },
//     itemLineTotal: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
//     itemFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
//     statusPill: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//         alignSelf: 'flex-start',
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         borderRadius: 20,
//     },
//     statusPillText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3 },
//     trackButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
//     trackButtonText: { fontSize: 11.5, fontWeight: '700', color: COLORS.primary },

//     // Per-item timeline (expandable)
//     itemTimelineBox: {
//         backgroundColor: COLORS.bg,
//         marginHorizontal: 14,
//         marginBottom: 14,
//         padding: 14,
//         borderRadius: 12,
//     },

//     // Timeline
//     timelineItem: { flexDirection: 'row' },
//     timelineDotCol: { alignItems: 'center', width: 24 },
//     timelineDot: {
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 2 },
//     timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
//     timelineStatus: { fontWeight: '700', fontSize: 13, color: COLORS.textDark, letterSpacing: 0.2 },
//     timelineNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
//     timelineDate: { fontSize: 11, color: COLORS.textLight, marginTop: 3 },

//     // Download button
//     downloadButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 8,
//         backgroundColor: COLORS.primary,
//         paddingVertical: 15,
//         borderRadius: 12,
//         marginTop: 4,
//         shadowColor: COLORS.primaryDark,
//         shadowOpacity: 0.25,
//         shadowOffset: { width: 0, height: 4 },
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     downloadButtonDisabled: { opacity: 0.7 },
//     downloadButtonText: { color: '#fff', fontSize: 15.5, fontWeight: '700' },
// });

// export default OrderDetailScreen;


import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Platform,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyOrdersById } from "../redux/slices/orderSlice";
import { Image } from "expo-image";

import { useSafeAreaInsets } from "react-native-safe-area-context";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isExpoGo = Constants.appOwnership === 'expo';

// ---------- Design tokens ----------
const COLORS = {
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryLight: '#DCFCE7',
    bg: '#F4F6F8',
    card: '#FFFFFF',
    border: '#EEF1F4',
    textDark: '#1A1D23',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
    danger: '#DC2626',
    warning: '#D97706',
    warningBg: '#FEF3C7',
};

// Delivery status -> color + icon mapping
const STATUS_META = {
    PENDING: { color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' },
    CONFIRMED: { color: '#2563EB', bg: '#DBEAFE', icon: 'checkmark-circle-outline' },
    PROCESSING: { color: '#7C3AED', bg: '#EDE9FE', icon: 'sync-outline' },
    SHIPPED: { color: '#0891B2', bg: '#CFFAFE', icon: 'cube-outline' },
    OUT_FOR_DELIVERY: { color: '#EA580C', bg: '#FFEDD5', icon: 'bicycle-outline' },
    DELIVERED: { color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-done-circle-outline' },
    CANCELLED: { color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle-outline' },
    RETURNED: { color: '#6B7280', bg: '#F3F4F6', icon: 'arrow-undo-outline' },
    DEFAULT: { color: '#6B7280', bg: '#F3F4F6', icon: 'ellipse-outline' },
};
const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.DEFAULT;

// Stage ranking — jitna aage stage utna zyada rank (progression check ke liye)
const STAGE_RANK = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
};

/**
 * Overall order status calculate karne ka logic:
 * 1. Agar koi bhi item CANCELLED nahi hai in active items me se, to unhe consider karo.
 *    Agar SAARE items hi cancelled hain -> order CANCELLED dikhao.
 * 2. Agar kam se kam EK item DELIVERED ya RETURNED hai (returned matlab pehle deliver ho chuka tha)
 *    -> order ko DELIVERED dikhao (chahe baaki items abhi processing/pending/return ho).
 * 3. Warna, agar kam se kam EK item PROCESSING ya usse aage (SHIPPED/OUT_FOR_DELIVERY/CONFIRMED) hai
 *    -> order ko PROCESSING dikhao.
 * 4. Warna (koi bhi item processing tak nahi pahuncha) -> order ko PENDING dikhao.
 */
const getOverallOrderStatus = (items) => {
    if (!items || items.length === 0) return 'PENDING';

    const activeItems = items.filter((i) => i.deliveryStatus !== 'CANCELLED');
    if (activeItems.length === 0) return 'CANCELLED';

    const anyDeliveredOrReturned = activeItems.some(
        (i) => i.deliveryStatus === 'DELIVERED' || i.deliveryStatus === 'RETURNED'
    );
    if (anyDeliveredOrReturned) return 'DELIVERED';

    const anyProcessingOrBeyond = activeItems.some(
        (i) => (STAGE_RANK[i.deliveryStatus] ?? 0) >= STAGE_RANK.PROCESSING
    );
    if (anyProcessingOrBeyond) return 'PROCESSING';

    return 'PENDING';
};

const OrderDetailScreen = () => {
    const insets = useSafeAreaInsets();

    const { id } = useLocalSearchParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const { orderData, ordersLoading, ordersError } = useSelector((state) => state.order);

    const [refreshing, setRefreshing] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [expandedItemId, setExpandedItemId] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchMyOrdersById(id));
        }
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(fetchMyOrdersById(id));
        setRefreshing(false);
    }, [id]);

    // ---------- Safe data extraction ----------
    const order = orderData || {};
    const items = order?.items || [];
    const overallStatus = getOverallOrderStatus(items);
    const overallMeta = getStatusMeta(overallStatus);

    // ---------- Navigate to product/variant page on item click ----------
    const goToProduct = (item) => {
        const productId = item?.product?.id;
        const variantId = item?.variant?.id;
        if (!productId || !variantId) return;
        router.push(`/product/${productId}/${variantId}`);
    };

    // ---------- Expand/collapse per-item timeline ----------
    const toggleItemTimeline = (itemId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedItemId((prev) => (prev === itemId ? null : itemId));
    };

    // ---------- PDF Generation + Download ----------
    const generateInvoicePDF = async () => {
        if (!order.orderNumber) {
            Alert.alert('Error', 'Order data is incomplete.');
            return;
        }

        setPdfLoading(true);
        try {
            const itemsRows = items.map((item, index) => {
                const attrs = item.variant?.attributes || {};
                const attrStr = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.product?.productName || 'N/A'}</td>
                        <td>${attrStr || '-'}</td>
                        <td>${item.quantity || 0}</td>
                        <td>₹${item.price || '0'}</td>
                        <td>₹${(parseInt(item.price) || 0) * (item.quantity || 0)}</td>
                        <td>${item.deliveryStatus || 'N/A'}</td>
                    </tr>
                `;
            }).join('');

            // Har item ka apna alag timeline section PDF me
            const perItemTimelineSections = items.map((item, index) => {

                const history = item.statusHistory || [];
                const rows = history.map(entry => `
                    <tr>
                        <td>${entry.status || ''}</td>
                        <td>${entry.note || ''}</td>
                        <td>${entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</td>
                    </tr>
                `).join('');
                return `
                    <h4>${index + 1}. 
  ${item.product?.productName || 'Item'}
  ${item?.variant?.description ? ` (${item.variant.description})` : ''}
</h4>
                    <table class="status-history-table">
                        <thead><tr><th>Status</th><th>Note</th><th>Date</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="3">No history available</td></tr>'}</tbody>
                    </table>
                `;
            }).join('');

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #16A34A; padding-bottom: 10px; }
                        .header h1 { margin: 0; color: #16A34A; }
                        .order-info { margin: 20px 0; }
                        .order-info table { width: 100%; }
                        .order-info td { padding: 5px; }
                        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .items-table th { background: #16A34A; color: white; padding: 10px; text-align: left; }
                        .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .total-row { font-weight: bold; }
                        .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 12px; color: #888; }
                        .status-history-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                        .status-history-table th { background: #f2f2f2; padding: 8px; text-align: left; }
                        .status-history-table td { padding: 8px; border-bottom: 1px solid #eee; }
                        h4 { margin-bottom: 6px; color: #1A1D23; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE</h1>
                        <p>Order #${order.orderNumber || ''}</p>
                    </div>

                    <div class="order-info">
                        <table>
                            <tr><td><strong>Order Date:</strong></td><td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td></tr>
                            <tr><td><strong>Customer:</strong></td><td>${order.fullName || ''}</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${order.phone || ''}</td></tr>
                            <tr><td><strong>Address:</strong></td><td>${order.addressLine || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}</td></tr>
                            <tr><td><strong>Payment:</strong></td><td>${order.orderType || ''} (${order.paymentStatus || ''})</td></tr>
                            <tr><td><strong>Order Status:</strong></td><td>${overallStatus}</td></tr>
                            <tr><td><strong>Total Amount:</strong></td><td>₹${order.totalAmount || '0'}</td></tr>
                        </table>
                    </div>

                    <h3>Order Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr><th>#</th><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                            <tr class="total-row">
                                <td colspan="5" style="text-align:right;">Grand Total</td>
                                <td colspan="2">₹${order.totalAmount || '0'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>Item-wise Timeline</h3>
                    ${perItemTimelineSections}

                    <div class="footer">
                        <p>Thank you for your order! This is a system-generated invoice.</p>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

            const fileName = `Invoice_${order.orderNumber}.pdf`;
            const newUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.copyAsync({ from: uri, to: newUri });

            if (Platform.OS === 'android' && !isExpoGo) {
                const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
                if (status === 'granted') {
                    const asset = await MediaLibrary.createAssetAsync(newUri);
                    await MediaLibrary.createAlbumAsync('Download', asset, false);
                    Alert.alert('Success', `Invoice download ho gaya: ${fileName}`);
                } else {
                    Alert.alert('Permission Required', 'Storage permission nahi mili. Share screen se PDF save/share kar sakte hain.');
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', dialogTitle: `Invoice #${order.orderNumber}` });
                    }
                }
            } else if (Platform.OS === 'android' && isExpoGo) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', dialogTitle: `Invoice #${order.orderNumber}` });
                } else {
                    Alert.alert('PDF generated', `File saved at: ${newUri}`);
                }
            } else {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `Invoice #${order.orderNumber}` });
                } else {
                    Alert.alert('PDF generated', `File saved at: ${newUri}`);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate invoice.');
        } finally {
            setPdfLoading(false);
        }
    };

    // ---------- Render Item Card (with click-to-navigate + own timeline) ----------
    const renderItem = ({ item, index }) => {
        const attributes = item.variant?.attributes || {};
        const attrString = Object.entries(attributes).map(([k, v]) => `${v}`).join(' • ');
        const meta = getStatusMeta(item.deliveryStatus);
        const lineTotal = (parseInt(item.price) || 0) * (item.quantity || 0);
        const itemKey = item.id?.toString() || index.toString();
        const isExpanded = expandedItemId === itemKey;
        const itemHistory = item.statusHistory || [];

        return (
            <View style={[styles.itemWrapper, index !== items.length - 1 && styles.itemCardDivider]}>
                <TouchableOpacity
                    style={styles.itemCard}
                    activeOpacity={0.7}
                    onPress={() => goToProduct(item)}
                >
                    <Image
                        source={item?.variant?.images?.[0]?.imageUrl || item.product?.imageUrl}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        style={styles.itemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>
                            {item.product?.productName || 'Unknown Product'}
                        </Text>
                        {!!attrString && (
                            <Text style={styles.itemVariant} numberOfLines={1}>{attrString}</Text>
                        )}

                        <View style={styles.itemMetaRow}>
                            <Text style={styles.itemQtyPrice}>
                                Qty {item.quantity || 0}  ·  ₹{item.price || '0'}
                            </Text>
                            <Text style={styles.itemLineTotal}>₹{lineTotal}</Text>
                        </View>

                        <View style={styles.itemFooterRow}>
                            <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                                <Ionicons name={meta.icon} size={12} color={meta.color} />
                                <Text style={[styles.statusPillText, { color: meta.color }]}>
                                    {(item.deliveryStatus || 'N/A').replace(/_/g, ' ')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.trackButton}
                                onPress={() => toggleItemTimeline(itemKey)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={styles.trackButtonText}>
                                    {isExpanded ? 'Hide Tracking' : 'Track Item'}
                                </Text>
                                <Ionicons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={14}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ alignSelf: 'center' }} />
                </TouchableOpacity>

                {/* Per-item timeline */}
                {isExpanded && (
                    <View style={styles.itemTimelineBox}>
                        {itemHistory.length === 0 ? (
                            <Text style={styles.emptyText}>No tracking updates for this item yet.</Text>
                        ) : (
                            itemHistory.map((entry, idx) => {
                                const entryMeta = getStatusMeta(entry.status);
                                const isLast = idx === itemHistory.length - 1;
                                return (
                                    <View key={idx} style={styles.timelineItem}>
                                        <View style={styles.timelineDotCol}>
                                            <View style={[styles.timelineDot, { backgroundColor: entryMeta.color }]}>
                                                <Ionicons name={entryMeta.icon} size={10} color="#fff" />
                                            </View>
                                            {!isLast && <View style={styles.timelineLine} />}
                                        </View>
                                        <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                                            <Text style={styles.timelineStatus}>
                                                {(entry.status || '').replace(/_/g, ' ')}
                                            </Text>
                                            {!!entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
                                            <Text style={styles.timelineDate}>
                                                {entry.changedAt ? new Date(entry.changedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ---------- Loading / Error / Empty States ----------
    if (ordersLoading && !orderData) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </View>
        );
    }

    if (ordersError) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
                    <Text style={styles.errorText}>{ordersError}</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retryButton} activeOpacity={0.85}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!order || Object.keys(order).length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centered}>
                    <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No order data available.</Text>
                </View>
            </View>
        );
    }

    const paymentMeta = order.paymentStatus === 'PAID'
        ? { color: COLORS.primary, bg: COLORS.primaryLight }
        : { color: COLORS.warning, bg: COLORS.warningBg };

    // ---------- Main UI ----------
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top Navigation Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollViewFlex}
                contentContainerStyle={styles.containerContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Order Header */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTopRow}>
                        <View style={[styles.headerIconWrap, { backgroundColor: overallMeta.bg }]}>
                            <Ionicons name={overallMeta.icon} size={22} color={overallMeta.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.orderNumber}>Order #{order.orderNumber || ''}</Text>
                            <Text style={styles.orderDate}>
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                        </View>
                        <View style={[styles.orderStatusBadge, { backgroundColor: overallMeta.bg }]}>
                            <Text style={[styles.orderStatusText, { color: overallMeta.color }]}>
                                {overallStatus.replace(/_/g, ' ')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerDivider} />

                    <View style={styles.headerBottomRow}>
                        <View>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.orderTotal}>₹{order.totalAmount || '0'}</Text>
                        </View>
                        <View style={styles.paymentBadgesWrap}>
                            <View style={[styles.paymentStatusBadge, { backgroundColor: paymentMeta.bg }]}>
                                <Text style={[styles.paymentStatusText, { color: paymentMeta.color }]}>
                                    {order.paymentStatus || 'PENDING'}
                                </Text>
                            </View>
                            <Text style={styles.orderPaymentType}>{order.orderType || ''}</Text>
                        </View>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                    </View>
                    <Text style={styles.addressName}>{order.fullName || ''}</Text>
                    <Text style={styles.addressLine}>{order.addressLine || ''}</Text>
                    <Text style={styles.addressLine}>
                        {order.city || ''}{order.city ? ', ' : ''}{order.state || ''} {order.pincode ? `- ${order.pincode}` : ''}
                    </Text>
                    <View style={styles.phoneRow}>
                        <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.phoneText}>{order.phone || ''}</Text>
                    </View>
                </View>

                {/* Items — click to open product, tap "Track Item" to see that item's own timeline */}
                <View style={[styles.section, { padding: 0, overflow: 'hidden' }]}>
                    <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16, paddingTop: 16 }]}>
                        <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Items ({items.length})</Text>
                    </View>
                    {items.length === 0 ? (
                        <Text style={[styles.emptyText, { padding: 16 }]}>No items found.</Text>
                    ) : (
                        <FlatList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Download Button */}
                <TouchableOpacity
                    style={[styles.downloadButton, pdfLoading && styles.downloadButtonDisabled]}
                    onPress={generateInvoicePDF}
                    disabled={pdfLoading}
                    activeOpacity={0.85}
                >
                    {pdfLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="download-outline" size={19} color="#fff" />
                            <Text style={styles.downloadButtonText}>Download Invoice</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollViewFlex: { flex: 1 },
    containerContent: { padding: 16 },

    // Top Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textDark,
    },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.bg },
    loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },
    errorText: { color: COLORS.danger, fontSize: 15, textAlign: 'center', marginTop: 12 },
    emptyText: { color: COLORS.textLight, fontSize: 14, textAlign: 'center' },
    retryButton: {
        marginTop: 18,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 28,
        paddingVertical: 11,
        borderRadius: 10,
    },
    retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Header Card
    headerCard: {
        backgroundColor: COLORS.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderNumber: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
    orderDate: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 },
    orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    orderStatusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
    headerDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
    headerBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    totalLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
    orderTotal: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
    paymentBadgesWrap: { alignItems: 'flex-end', gap: 6 },
    paymentStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    paymentStatusText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3 },
    orderPaymentType: { fontSize: 12, color: COLORS.textMuted },

    // Section
    section: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
        elevation: 2,
    },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 15.5, fontWeight: '700', color: COLORS.textDark },

    // Address
    addressName: { fontWeight: '700', fontSize: 14.5, color: COLORS.textDark, marginBottom: 4 },
    addressLine: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 20 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    phoneText: { fontSize: 13.5, color: COLORS.textMuted },

    // Item card
    itemWrapper: { paddingHorizontal: 0 },
    itemCardDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    itemCard: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'flex-start' },
    itemImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: COLORS.bg },
    itemInfo: { flex: 1, justifyContent: 'center', gap: 4 },
    itemName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
    itemVariant: { fontSize: 12.5, color: COLORS.textMuted },
    itemMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
    itemQtyPrice: { fontSize: 12.5, color: COLORS.textMuted },
    itemLineTotal: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
    itemFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusPillText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3 },
    trackButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    trackButtonText: { fontSize: 11.5, fontWeight: '700', color: COLORS.primary },

    // Per-item timeline (expandable)
    itemTimelineBox: {
        backgroundColor: COLORS.bg,
        marginHorizontal: 14,
        marginBottom: 14,
        padding: 14,
        borderRadius: 12,
    },

    // Timeline
    timelineItem: { flexDirection: 'row' },
    timelineDotCol: { alignItems: 'center', width: 24 },
    timelineDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 2 },
    timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
    timelineStatus: { fontWeight: '700', fontSize: 13, color: COLORS.textDark, letterSpacing: 0.2 },
    timelineNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    timelineDate: { fontSize: 11, color: COLORS.textLight, marginTop: 3 },

    // Download button
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 4,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 3,
    },
    downloadButtonDisabled: { opacity: 0.7 },
    downloadButtonText: { color: '#fff', fontSize: 15.5, fontWeight: '700' },
});

export default OrderDetailScreen;