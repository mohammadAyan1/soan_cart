
import express from "express"
// import { savePushToken } from "../../controller/notification/pushTokenController.js";
import { sendToAllUsers, sendToSingleUser } from "../../controller/notification/notificationController.js";
import { requiredAuth } from "../../middleware/auth.middleware.js";
const notificationRouter = express.Router()

// notificationRouter.post('/save-push-token', requiredAuth, savePushToken);
notificationRouter.post('/send-all', requiredAuth, sendToAllUsers);
notificationRouter.post('/send-one', requiredAuth, sendToSingleUser);

// module.exports = router;
export default notificationRouter