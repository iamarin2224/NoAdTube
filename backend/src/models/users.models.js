import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {   //id is by default assigned by mongodb
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true //helps to find them quickly, shouldnt be applied to every field
        },
        password: {
            type: String,
            required: function() {
                return !this.googleId;
            },
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url or generated initial avatar
        },
        coverImage: {
            type: String //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        refreshToken: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationOTP: {
            type: String
        },
        emailVerificationExpires: {
            type: Date
        },
        googleId: {
            type: String
        }
    },
    { timestamps: true} //this automatically creates createdAt and updatedAt fields
)

userSchema.pre("save", async function(next) {
    if (!this.password || !this.isModified("password")) return next()   
    //wont run everytime save is hit, rather when passowrd is modified or saved for first time
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User", userSchema);
//common practice to create the model name with capital letter