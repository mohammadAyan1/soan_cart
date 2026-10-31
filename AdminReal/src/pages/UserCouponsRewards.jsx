import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCoupons, fetchUserRewards } from "../redux/slices/couponRewardSlice";
import { Tag, Award } from "lucide-react";

const UserCouponsRewards = () => {
    const dispatch = useDispatch();
    const { userCoupons, userRewards } = useSelector((state) => state.couponReward);

    useEffect(() => {
        dispatch(fetchUserCoupons());
        dispatch(fetchUserRewards());
    }, [dispatch]);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Active Coupons Section */}
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Tag className="text-blue-600" /> Available Coupons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCoupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white p-5 rounded-2xl border-2 border-blue-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-extrabold text-lg text-blue-700 tracking-wide">{coupon.code}</span>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-semibold">{coupon.type}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{coupon.description || "No description provided."}</p>
                            </div>
                            <div className="text-xs text-gray-400 border-t pt-2 flex justify-between">
                                <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                <span className={coupon.canUse ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                                    {coupon.remainingUses !== null ? `${coupon.remainingUses} uses left` : "Unlimited Uses"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Rewards Section */}
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Award className="text-purple-600" /> Your Personal Rewards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRewards.length === 0 ? (
                        <p className="text-gray-400 text-sm">Aapke liye koi reward available nahi hai abhi.</p>
                    ) : (
                        userRewards.map((reward) => (
                            <div key={reward.id} className="bg-white p-5 rounded-2xl border-2 border-purple-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-extrabold text-lg text-purple-700 tracking-wide">{reward.code}</span>
                                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded font-semibold">{reward.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{reward.description || "Special Reward for you!"}</p>
                                </div>
                                <div className="text-xs text-gray-400 border-t pt-2 flex justify-between">
                                    <span>Expires: {new Date(reward.expiryDate).toLocaleDateString()}</span>
                                    <span className="text-green-600 font-semibold">Ready to Use</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCouponsRewards;