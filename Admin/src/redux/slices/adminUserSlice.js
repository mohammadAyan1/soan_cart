import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// ---------------- GET ALL USERS ----------------
export const fetchAllUsers = createAsyncThunk(
    "adminUser/fetchAllUsers",
    async ({ page = 1, limit = 10, search = "", role = "" } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/admin/users", {
                params: { page, limit, search, role },
            });


            return res
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Users fetch nahi ho paaye" }
            );
        }
    }
);

// ---------------- GET SINGLE USER (with addresses) ----------------
export const fetchUserById = createAsyncThunk(
    "adminUser/fetchUserById",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/admin/users/${userId}`);
            return res?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "User detail fetch nahi hua" }
            );
        }
    }
);

// ---------------- UPDATE ROLE ----------------
export const updateUserRole = createAsyncThunk(
    "adminUser/updateUserRole",
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/api/admin/users/${userId}/role`, { role });
            return res.data.data; // { id, fullName, email, role }
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Role update nahi hua" }
            );
        }
    }
);

// ---------------- TOGGLE STATUS (activate/deactivate) ----------------
export const toggleUserStatus = createAsyncThunk(
    "adminUser/toggleUserStatus",
    async ({ userId, isActive }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/api/admin/users/${userId}/status`, { isActive });
            return res.data.data; // { id, fullName, email, isDelete }
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Status update nahi hua" }
            );
        }
    }
);

// ---------------- GET USER PASSWORD ----------------
export const fetchUserPassword = createAsyncThunk(
    "adminUser/fetchUserPassword",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/admin/users/${userId}/password`);
            return res.data.data; // { userId, fullName, email, password }
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Password fetch nahi hua" }
            );
        }
    }
);

const initialState = {
    // List
    users: [],
    pagination: { totalCount: 0, currentPage: 1, totalPages: 1, limit: 10 },
    listLoading: false,
    listError: null,

    // Selected user (detail modal)
    selectedUser: null,
    detailLoading: false,
    detailError: null,

    // Role update
    roleUpdateLoading: false,
    roleUpdateError: null,

    // Status toggle
    statusUpdateLoading: false,
    statusUpdateError: null,

    // Password reveal
    passwordData: null, // { userId, fullName, email, password }
    passwordLoading: false,
    passwordError: null,
};

const adminUserSlice = createSlice({
    name: "adminUser",
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
            state.detailError = null;
        },
        clearPasswordData: (state) => {
            state.passwordData = null;
            state.passwordError = null;
        },
        clearAdminUserErrors: (state) => {
            state.listError = null;
            state.roleUpdateError = null;
            state.statusUpdateError = null;
            state.passwordError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- LIST ----------
            .addCase(fetchAllUsers.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.listLoading = false;
                state.users = action.payload.data || [];
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload?.message;
            })

            // ---------- DETAIL ----------
            .addCase(fetchUserById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload?.message;
            })

            // ---------- ROLE UPDATE ----------
            .addCase(updateUserRole.pending, (state) => {
                state.roleUpdateLoading = true;
                state.roleUpdateError = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.roleUpdateLoading = false;
                // List me bhi wahi user update kar do (bina refetch kiye)
                const idx = state.users.findIndex((u) => u.id === action.payload.id);
                if (idx !== -1) {
                    state.users[idx].role = action.payload.role;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.role = action.payload.role;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.roleUpdateLoading = false;
                state.roleUpdateError = action.payload?.message;
            })

            // ---------- STATUS TOGGLE ----------
            .addCase(toggleUserStatus.pending, (state) => {
                state.statusUpdateLoading = true;
                state.statusUpdateError = null;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.statusUpdateLoading = false;
                const idx = state.users.findIndex((u) => u.id === action.payload.id);
                if (idx !== -1) {
                    state.users[idx].isDelete = action.payload.isDelete;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.isDelete = action.payload.isDelete;
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.statusUpdateLoading = false;
                state.statusUpdateError = action.payload?.message;
            })

            // ---------- PASSWORD ----------
            .addCase(fetchUserPassword.pending, (state) => {
                state.passwordLoading = true;
                state.passwordError = null;
            })
            .addCase(fetchUserPassword.fulfilled, (state, action) => {
                state.passwordLoading = false;
                state.passwordData = action.payload;
            })
            .addCase(fetchUserPassword.rejected, (state, action) => {
                state.passwordLoading = false;
                state.passwordError = action.payload?.message;
            });
    },
});

export const { clearSelectedUser, clearPasswordData, clearAdminUserErrors } =
    adminUserSlice.actions;
export default adminUserSlice.reducer;