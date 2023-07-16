import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";

const ToolCategorySchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        category: Type.string({ required: true }),
        description: Type.string({ required: false }),
        isDisplayInApp: Type.boolean({ required: true, default: true }),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const ToolCategorySchema = typedModel(
    "toolCategory",
    ToolCategorySchemaDocument
);
export type ToolCategoryDoc = ExtractDoc<typeof ToolCategorySchema>;
export type ToolCategoryProps = ExtractProps<typeof ToolCategorySchema>;
