import jwt from "jsonwebtoken"
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];


    } else if (req.cookies.token) {
        token = req.cookies.token;


    }

    if (!token) {

        req.user = null;
        return next();
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        req.user = decoded;
    } catch (err) {


        req.user = null;
    }

    next();
};