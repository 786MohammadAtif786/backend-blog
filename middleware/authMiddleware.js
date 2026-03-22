import jwt from "jsonwebtoken"

export const protect = (req, res, next) => {

    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Token expired"
        });

    }

};

export const isAdmin = (req, res, next) => {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin only"
        })
    }

    next()

}