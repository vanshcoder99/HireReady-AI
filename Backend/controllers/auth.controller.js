import genToken from "../config/token.js";
import User from "../models/user.model.js";

export const googleAuth = async (req,res) => {
    try{
        const {name, email} = req.body;

        if(!name || !email){
            throw new Error("Name and Email are required")
        }

        let user = await User.findOne({email})

        if(!user){
            user = await User.create({
                name,
                email
            })
        }


        let token = await genToken(user._id)

        res.cookie("token", token,{
            http: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            user,
            message: "user created or logged in successfully",
            statusCode: 200
        })
    } catch(error){
        return res.status(500).json({
            message: `Google auth error ${error}`
        })
    }
}