import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";

const UserTokenSchemaDocument = createSchema({
    userId: Type.string({ required: true }),
    token: Type.string({ required: true }),
    createdAt: Type.date({ default: Date.now, expires: 30 * 86400 }), // 30 days
});

export const UserTokenSchema = typedModel("userToken", UserTokenSchemaDocument);
