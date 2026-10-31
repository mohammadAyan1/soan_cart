import express from "express";
import {
    createReward,
    getAllRewardsAdmin,
    getRewardByIdAdmin,
    updateReward,
    toggleRewardActive,
    toggleRewardDeleteAdmin,
    getMyRewards,
} from "../controller/reward.controller.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

const rewardRoutes = express.Router();

// ---------------- USER routes ----------------
rewardRoutes.get("/my-rewards", requiredAuth, getMyRewards);

// ---------------- ADMIN only ----------------
// NOTE: "/admin/all" ko "/admin/:rewardId" se pehle hi rakhna
rewardRoutes.post("/admin/create", requiredAuth, createReward);
rewardRoutes.get("/admin/all", requiredAuth, getAllRewardsAdmin);
rewardRoutes.get("/admin/:rewardId", requiredAuth, getRewardByIdAdmin);
rewardRoutes.put("/admin/:rewardId", requiredAuth, updateReward);
rewardRoutes.patch("/admin/:rewardId/toggle-active", requiredAuth, toggleRewardActive);
rewardRoutes.patch("/admin/:rewardId/toggle-delete", requiredAuth, toggleRewardDeleteAdmin);

export default rewardRoutes;