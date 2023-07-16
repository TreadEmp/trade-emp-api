import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";
import { JobRequestStatus } from "../../utils/enums";

const JobRequestFileUploadDocument = createSchema(
    {
        id: Type.string({ required: false }),
        name: Type.string({ required: false }),
        type: Type.string({ required: false }),
        url: Type.string({ required: false }),
        size: Type.number({ required: false, default: 0 }),
        uploadedAt: Type.string({ required: false }),
        uploadedBy: Type.string({ required: false }),
    },
    { _id: false }
);

const PriceSchemaDocument = createSchema(
    {
        id: Type.string({ required: true }),
        price: Type.number({ required: true, default: 0 }),
        unitsOfMeasure: Type.string({ required: true }),
    },
    { _id: false}
);

const FaqSchemaDocument = createSchema(
    {
        id: Type.string({ required: true }),
        question: Type.string({ required: false }),
        answer: Type.string({ required: false }),
    },
    { _id: false}
);

const LocationSchemaDocument = createSchema(
    {
        type: Type.string({ required: false }),
        coordinates: Type.array({ required: false }).of(
            Type.number({ required: false })
        ),
    },
    { _id: false}
);

const JobRequestSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        employerId: Type.string({ required: false }),
        employeeId: Type.string({ required: true }),
        isActive: Type.boolean({ required: true, default: false }),
        category: Type.string({ required: true }),
        title: Type.string({ required: true }),
        description: Type.string({ required: true }),
        faqs: Type.array({ required: false }).of(FaqSchemaDocument),
        prices: Type.array({ required: false }).of(PriceSchemaDocument),
        images: Type.array({ required: false }).of(
            JobRequestFileUploadDocument
        ),
        location: Type.object({ required: false }).of(LocationSchemaDocument),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const JobRequestSchema = typedModel("JobRequest", JobRequestSchemaDocument);
export type JobRequestDoc = ExtractDoc<typeof JobRequestSchema>;
export type JobRequestProps = ExtractProps<typeof JobRequestSchema>;
