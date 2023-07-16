import {
    createSchema, Type, typedModel,
    ExtractDoc, ExtractProps,
} from "ts-mongoose";

const UserRoleSchemaDocument = createSchema({
    _id: Type.objectId({ auto: true }),
    id: Type.string({ required: true }),
    roleName: Type.string({ required: true }),
    permissions: Type.mixed({ required: false }),
}, { _id: true, timestamps: { createdAt: true } });

export const UserRoleSchema = typedModel("userRole", UserRoleSchemaDocument);
// export type UserRoleDoc = ExtractDoc<typeof UserRoleSchema>;
// export type UserRoleProps = ExtractProps<typeof UserRoleSchema>;
