import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";
import { getLocationHeaders } from "@/utils/locationInfo"; // 👈 NAYA IMPORT

// ---------------- LOGIN ----------------
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (data, { rejectWithValue }) => {
        try {
            const guestId = await AsyncStorage.getItem("guestId");

            // 👇 NAYA - login se pehle GPS location fetch karo, headers me bhejo
            const locationHeaders = await getLocationHeaders();

            const headers = { ...locationHeaders };
            if (guestId) {
                headers["x-guest-id"] = guestId;
            }

            const res = await api.post("/api/auth/login", data, { headers });

            await AsyncStorage.setItem("token", res.data.token);
            await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

            await AsyncStorage.removeItem("sessionId");
            if (res.data.sessionId) {
                await AsyncStorage.setItem("sessionId", res.data.sessionId);
            }

            if (res.data.guestCartMerged) {
                await AsyncStorage.removeItem("guestId");
            }

            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Something went wrong" });
        }
    }
);


// ---------------- PUSH NOTIFICATION ----------------
// authSlice.js me add karo
export const registerPushToken = createAsyncThunk(
    'auth/registerPushToken',
    async (pushToken, { rejectWithValue }) => {
        try {
            console.log(pushToken, "PushToken");

            const response = await api.post('/api/auth/save-push-token', { pushToken });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save push token');
        }
    }
);


// baaki poora file (logoutUser, updateProfile, fetchUserProfile, loadAuthFromStorage,
// aur poora authSlice createSlice block) BILKUL SAME rahega - koi change nahi

// ---------------- LOGOUT ----------------
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/api/auth/logout");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("sessionId"); // 👈 NAYI LINE
            return true;
        } catch (error) {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("sessionId"); // 👈 NAYI LINE
            return rejectWithValue(error.response?.data);
        }
    }
);

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.put("/api/auth/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const stored = await AsyncStorage.getItem("user");
            const oldUser = stored ? JSON.parse(stored) : {};
            const newUser = { ...oldUser, ...res.data.user };
            await AsyncStorage.setItem("user", JSON.stringify(newUser));
            return res.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Profile update failed" });
        }
    }
);

// ---------------- FETCH USER PROFILE ----------------
export const fetchUserProfile = createAsyncThunk(
    "auth/fetchUserProfile",
    async ({ isRefresh = false } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/auth/me");
            await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
            return res.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to load profile");
        }
    }
);

// ---------------- LOAD FROM STORAGE ----------------
export const loadAuthFromStorage = createAsyncThunk(
    "auth/loadAuthFromStorage",
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userStr = await AsyncStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            if (!token || !user) return rejectWithValue("No stored session");
            return { token, user };
        } catch (error) {
            return rejectWithValue("Failed to load session");
        }
    }
);

// ==========================================================
// 👇 NAYE THUNKS - inko apni existing authSlice.js file me
// existing thunks (login, logoutUser, updateProfile) ke
// saath hi add kar do
// ==========================================================

// Vendor Register - FormData bhejta hai (name, phone, email, password, image)
export const vendorRegister = createAsyncThunk(
    "auth/vendorRegister",
    async (formData, { rejectWithValue }) => {
        try {
            // const res = await api.post("/api/auth/vendor-register", formData, {
            //     headers: { "Content-Type": "multipart/form-data" },
            // });


            const res = await api.post(`/api/auth/${formData?.type === "user" ? "register" : 'vendor-register'}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Vendor registration failed"
            );
        }
    }
);

// OTP Verify - vendor register ke baad email verify karne ke liye
export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/auth/verify-otp", { email, otp });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "OTP verification failed");
        }
    }
);

// Resend OTP - vendor verify screen aur forget password dono jagah reuse hoga
export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async ({ email }, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/auth/resend-otp", { email });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Resend OTP failed");
        }
    }
);

// Forget Password - email + otp + new password leke reset karta hai
export const forgetPassword = createAsyncThunk(
    "auth/forgetPassword",
    async ({ email, password, otp }, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/auth/forget-password", { email, password, otp });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Password reset failed");
        }
    }
);



const initialState = {
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
    updateLoading: false,
    profileLoading: false,
    profileRefreshing: false,
    error: null,

    // ... tumhare existing fields (isLoggedIn, user, loading, profileLoading, etc.) jaise ke waise rehne do

    // 👇 NAYE FIELDS

    // Vendor register ke liye
    vendorRegisterLoading: false,
    vendorRegisterError: null,
    vendorRegisterSuccess: false,
    pendingVendorEmail: null, // 👈 register ke baad email store hota hai, verify-otp screen isko use karega

    // OTP verify ke liye
    verifyOtpLoading: false,
    verifyOtpError: null,
    verifyOtpSuccess: false,

    // Resend OTP ke liye
    resendOtpLoading: false,
    resendOtpError: null,

    // Forget password ke liye
    forgetPasswordLoading: false,
    forgetPasswordError: null,
    forgetPasswordSuccess: false,



};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        updateUserLocal: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // ---------- LOGIN ----------
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // ---------- LOGOUT ----------
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isLoggedIn = false;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isLoggedIn = false;
            })

            // ---------- UPDATE PROFILE ----------
            .addCase(updateProfile.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.user = { ...state.user, ...action.payload };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload?.message;
            })

            // ---------- FETCH USER PROFILE ----------
            .addCase(fetchUserProfile.pending, (state, action) => {
                if (action.meta.arg?.isRefresh) {
                    state.profileRefreshing = true;
                } else {
                    state.profileLoading = true;
                }
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profileRefreshing = false;
                state.user = action.payload;
                state.isLoggedIn = true
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileRefreshing = false;
                state.error = action.payload;
            })


            // authSlice ke extraReducers builder ke andar, existing cases ke saath ye add karo:

            // ---------- VENDOR REGISTER ----------
            .addCase(vendorRegister.pending, (state) => {
                state.vendorRegisterLoading = true;
                state.vendorRegisterError = null;
                state.vendorRegisterSuccess = false;
            })
            .addCase(vendorRegister.fulfilled, (state, action) => {
                state.vendorRegisterLoading = false;
                state.vendorRegisterSuccess = true;
                state.pendingVendorEmail = action.meta.arg.get
                    ? action.meta.arg.get("email") // FormData se email nikal rahe hain
                    : action.meta.arg.email;
            })
            .addCase(vendorRegister.rejected, (state, action) => {
                state.vendorRegisterLoading = false;
                state.vendorRegisterError = action.payload;
            })

            // ---------- VERIFY OTP ----------
            .addCase(verifyOtp.pending, (state) => {
                state.verifyOtpLoading = true;
                state.verifyOtpError = null;
                state.verifyOtpSuccess = false;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.verifyOtpLoading = false;
                state.verifyOtpSuccess = true;
                state.pendingVendorEmail = null; // verify ho gaya, ab clear kar do
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.verifyOtpLoading = false;
                state.verifyOtpError = action.payload;
            })

            // ---------- RESEND OTP ----------
            .addCase(resendOtp.pending, (state) => {
                state.resendOtpLoading = true;
                state.resendOtpError = null;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.resendOtpLoading = false;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.resendOtpLoading = false;
                state.resendOtpError = action.payload;
            })

            // ---------- FORGET PASSWORD ----------
            .addCase(forgetPassword.pending, (state) => {
                state.forgetPasswordLoading = true;
                state.forgetPasswordError = null;
                state.forgetPasswordSuccess = false;
            })
            .addCase(forgetPassword.fulfilled, (state) => {
                state.forgetPasswordLoading = false;
                state.forgetPasswordSuccess = true;
            })
            .addCase(forgetPassword.rejected, (state, action) => {
                state.forgetPasswordLoading = false;
                state.forgetPasswordError = action.payload;
            })
            // ---------- LOAD FROM STORAGE ----------
            .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = true;
            })
            .addCase(loadAuthFromStorage.rejected, (state) => {
                state.isLoggedIn = false;
            });
    },
});

export const { updateUserLocal, clearAuthError } = authSlice.actions;
export default authSlice.reducer;