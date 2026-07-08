import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/index.js";

const userSchema = new Schema({

    firstName: { type: String, required: true, min: 3, max: 25 },
    middleName: { type: String, required: false, min: 3, max: 25 },
    lastName: { type: String, required: false, min: 3, max: 25 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.provider == ProviderEnum.System } },
    confirmEmail: { type: Date },
    role: {
        type: Number,
        enum: Object.values(RoleEnum),
        default: RoleEnum.Reception,
    },
    profilePicture: { 
        secure_url: String,
        public_id: String 

    },
     profileCoverPicture: { 
        secure_url: String,
        public_id: String 

    },
   
    oldPassword: [
        String
    ],
    changeCredentialTime: { type: Date, required: false },
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.male
    },
    age: { type: Number, required: false },
    phone: { type: String, required: false },
    deleteAt: { type: Date, required: false },
    provider: {
        type: Number,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.System
    },
   

}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "User"

})

userSchema.virtual("fullName")
    .get(function () {
        return `${this.firstName || ""} ${this.middleName || ""} ${this.lastName || ""}`.trim();
    })
    .set(function (value) {
        const [firstName, middleName,lastName] = value.split(" ");
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;

    });


export const userModel = model.User || model("User", userSchema)