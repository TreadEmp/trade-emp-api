import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";
import { JobStatus } from "../../utils/enums";

const JobFileUploadDocument = createSchema(
    {
        id: Type.string({ required: false }),
        name: Type.string({ required: false }),
        type: Type.string({ required: false }),
        url: Type.string({ required: false }),
        size: Type.number({ required: false, default: 0 }),
        uploadedAt: Type.string({ required: false }),
        uploadedBy: Type.string({ required: false }),
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
    { _id: false }
);

const JobSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        employerId: Type.string({ required: true }),
        employeeId: Type.string({ required: false }),
        status: Type.string({
            required: true,
            default: JobStatus.PENDING,
            enum: [JobStatus.HIRED, JobStatus.PENDING, JobStatus.COMPLETED],
        }),
        category: Type.string({ required: true }),
        title: Type.string({ required: true }),
        description: Type.string({ required: true }),
        location: Type.object({ required: false }).of(LocationSchemaDocument),
        faqs: Type.array({ required: false }).of(FaqSchemaDocument),
        images: Type.array({ required: false }).of(JobFileUploadDocument),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const JobSchema = typedModel("Job", JobSchemaDocument);
export type JobDoc = ExtractDoc<typeof JobSchema>;
export type JobProps = ExtractProps<typeof JobSchema>;
