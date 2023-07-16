import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";

const EquipmentSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        name: Type.string({ required: true }),
        category: Type.string({ required: true }),
        description: Type.string({ required: false }),
        isDisplayInApp: Type.boolean({ required: true, default: true }),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const EquipmentSchema = typedModel("equipment", EquipmentSchemaDocument);
export type EquipmentDoc = ExtractDoc<typeof EquipmentSchema>;
export type EquipmentProps = ExtractProps<typeof EquipmentSchema>;
