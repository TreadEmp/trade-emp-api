import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";

const FileUploadDocument = createSchema(
    {
        id: Type.string({ required: false }),
        name: Type.string({ required: false }),
        type: Type.string({ required: false }),
        url: Type.string({ required: false }),
        size: Type.number({ required: false, default: 0 }),
        uploadedAt: Type.string({ required: false }),
        uploadedBy: Type.string({ required: false }),
    },
    { _id: false, timestamps: { createdAt: true } }
);

const JobCategorySchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        category: Type.string({ required: true }),
        description: Type.string({ required: false }),
        image: Type.object({ required: false }).of(FileUploadDocument),
        isDisplayInApp: Type.boolean({ required: true, default: true }),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const JobCategorySchema = typedModel(
    "jobCategory",
    JobCategorySchemaDocument
);
export type JobCategoryDoc = ExtractDoc<typeof JobCategorySchema>;
export type JobCategoryProps = ExtractProps<typeof JobCategorySchema>;
