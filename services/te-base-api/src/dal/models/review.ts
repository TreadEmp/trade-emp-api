import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps
} from "ts-mongoose";

const ReviewFileUploadDocument = createSchema({
    id: Type.string({ required: false }),
    name: Type.string({ required: false }),
    type: Type.string({ required: false }),
    url: Type.string({ required: false }),
    size: Type.number({ required: false, default: 0 }),
    uploadedAt: Type.string({ required: false }),
    uploadedBy: Type.string({ required: false }),
}, { _id: false, timestamps: { createdAt: true } }
);

const ReviewSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        jobType: Type.string({ required: true }), //job, job-request
        jobId: Type.string({ required: true }),
        /* 
        For the job, the employee who completed the job.
        For the job-request, the employee who provide the service
        */
        holderId: Type.string({ required: true }),
        /* 
        For the job, the employer who posted the job.
        For the job-request, the employer who get the service
        */
        reviewedBy: Type.string({ required: true }),
        review: Type.string({ required: true }),
        rating: Type.number({ required: true, default: 0.0 }),
        communication: Type.number({ required: false, default: 0.0 }),
        serviceAsDescribed: Type.number({ required: false, default: 0.0 }),
        recommend: Type.number({ required: false, default: 0.0 }),
        completionOnTime: Type.number({ required: false, default: 0.0 }),
        images: Type.array({ required: false }).of(ReviewFileUploadDocument),
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const ReviewSchema = typedModel("Review", ReviewSchemaDocument);
export type ReviewDoc = ExtractDoc<typeof ReviewSchema>;
export type ReviewProps = ExtractProps<typeof ReviewSchema>;