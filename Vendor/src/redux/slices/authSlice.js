import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ---------------------------------------------------------
// THUNKS
// ---------------------------------------------------------

export const vendorRegister = createAsyncThunk(
    "auth/vendorRegister",
    async (formData, { rejectWithValue }) => {
        try {
            // formData: FormData with fullName, phone, email, password, image(optional)
            const res = await axiosInstance.post("/auth/vendor-register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Registration failed");
        }
    }
);

export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "OTP verify nahi hua");
        }
    }
);

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async ({ email }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/auth/resend-otp", { email });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "OTP resend nahi hua");
        }
    }
);

export const forgetPassword = createAsyncThunk(
    "auth/forgetPassword",
    async ({ email, password, otp }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/auth/forget-password", { email, password, otp });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Password reset nahi hua");
        }
    }
);

export const loginVendor = createAsyncThunk(
    "auth/loginVendor",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/auth/login", { email, password });

            if (res.data?.user?.role !== "VENDOR") {
                return rejectWithValue("Ye vendor panel hai. Is account ka role VENDOR nahi hai.");
            }

            if (res.data?.token) {
                localStorage.setItem("vendor_token", res.data.token);
            }
            if (res.data?.sessionId) {
                localStorage.setItem("vendor_session_id", res.data.sessionId);
            }

            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Login fail ho gaya");
        }
    }
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.get("/auth/me");

        if (res.data?.user?.role !== "VENDOR") {
            return rejectWithValue("Not a vendor account");
        }

        return res.data.user;
    } catch (error) {
        return rejectWithValue(error?.response?.data?.message || "Session nahi mili");
    }
});

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.user;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Profile update nahi hua");
        }
    }
);

export const logoutVendor = createAsyncThunk("auth/logoutVendor", async (_, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.post("/auth/logout");
        localStorage.removeItem("vendor_token");
        localStorage.removeItem("vendor_session_id");
        return res.data;
    } catch (error) {
        // Local session to clear kar hi denge, chahe API fail ho jaye
        localStorage.removeItem("vendor_token");
        localStorage.removeItem("vendor_session_id");
        return rejectWithValue(error?.response?.data?.message || "Logout me dikkat aayi");
    }
});

// ---------------------------------------------------------
// SLICE
// ---------------------------------------------------------

const initialState = {
    user: null,
    isAuthChecked: false, // 👈 app load pe fetchMe complete hua ya nahi

    loading: false,
    error: null,

    registerLoading: false,
    registerError: null,
    registeredEmail: null,

    otpLoading: false,
    otpError: null,
    otpSuccessMessage: null,

    forgetPasswordLoading: false,
    forgetPasswordError: null,
    forgetPasswordSuccess: false,

    profileLoading: false,
    profileError: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
            state.registerError = null;
            state.otpError = null;
            state.forgetPasswordError = null;
            state.profileError = null;
        },
        resetForgetPasswordState: (state) => {
            state.forgetPasswordSuccess = false;
            state.forgetPasswordError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- Register ----------
            .addCase(vendorRegister.pending, (state) => {
                state.registerLoading = true;
                state.registerError = null;
            })
            .addCase(vendorRegister.fulfilled, (state, action) => {
                state.registerLoading = false;
                state.registeredEmail = action.meta.arg.get("email");
            })
            .addCase(vendorRegister.rejected, (state, action) => {
                state.registerLoading = false;
                state.registerError = action.payload;
            })

            // ---------- Verify OTP ----------
            .addCase(verifyOtp.pending, (state) => {
                state.otpLoading = true;
                state.otpError = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.otpLoading = false;
                state.otpSuccessMessage = action.payload?.message;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.otpLoading = false;
                state.otpError = action.payload;
            })

            // ---------- Resend OTP ----------
            .addCase(resendOtp.pending, (state) => {
                state.otpLoading = true;
                state.otpError = null;
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.otpLoading = false;
                state.otpSuccessMessage = action.payload?.message;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.otpLoading = false;
                state.otpError = action.payload;
            })

            // ---------- Forget Password ----------
            .addCase(forgetPassword.pending, (state) => {
                state.forgetPasswordLoading = true;
                state.forgetPasswordError = null;
            })
            .addCase(forgetPassword.fulfilled, (state) => {
                state.forgetPasswordLoading = false;
                state.forgetPasswordSuccess = true;
            })
            .addCase(forgetPassword.rejected, (state, action) => {
                state.forgetPasswordLoading = false;
                state.forgetPasswordError = action.payload;
            })

            // ---------- Login ----------
            .addCase(loginVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthChecked = true;
            })
            .addCase(loginVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---------- Fetch Me (session restore) ----------
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthChecked = true;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthChecked = true;
            })

            // ---------- Update Profile ----------
            .addCase(updateProfile.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = { ...state.user, ...action.payload };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError = action.payload;
            })

            // ---------- Logout ----------
            .addCase(logoutVendor.fulfilled, (state) => {
                state.user = null;
            })
            .addCase(logoutVendor.rejected, (state) => {
                state.user = null;
            });
    },
});

export const { clearAuthError, resetForgetPasswordState } = authSlice.actions;
export default authSlice.reducer;