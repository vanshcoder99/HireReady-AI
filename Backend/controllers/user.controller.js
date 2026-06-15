import { useId } from "react"
import User from "../models/user.model.js"


export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(useId)
        if(!user){
            return res.status(404).json({
                message: "user does not found",
                statusCode: 404
            })
        }

        return res.status(200).json({
            user,
            message: "User found successfully",
            statusCode: 200
        })
    } catch (error) {
        return res.status(500).json({
            message: `failded to get current user ${error}`
        })
    }
}