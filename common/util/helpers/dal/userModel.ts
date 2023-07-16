import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";

const AddressDocument = createSchema(
    {
        addressName: Type.string({ required: false }),
        addressLine1: Type.string({ required: false }),
        addressLine2: Type.string({ required: false }),
        suburb: Type.string({ required: false }),
        city: Type.string({ required: false }),
        state: Type.string({ required: false }),
        postalCode: Type.string({ required: false }),
        country: Type.string({ required: false }),
        latitude: Type.string({ required: false }),
        longitude: Type.string({ required: false }),
    },
    { _id: false, timestamps: { createdAt: true } }
);

const ContactsDocument = createSchema(
    {
        telephone: Type.string({ required: false }),
        fax: Type.string({ required: false }),
        mobile: Type.string({ required: false }),
    },
    { _id: false, timestamps: { createdAt: true } }
);

const UserExperiencesDocument = createSchema(
    {
        id: Type.string({ required: true }),
        experience: Type.string({ required: false }),
        timePeriod: Type.string({ required: false }),
    },
    { _id: false, timestamps: { createdAt: true } }
);

const UserEquipmentsDocument = createSchema(
    {
        id: Type.string({ required: true }),
        equipmentName: Type.string({ required: false }),
        yearsOfUsing: Type.string({ required: false }),
    },
    { _id: false, timestamps: { createdAt: true } }
);

const UserFileUploadDocument = createSchema(
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

const UserSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        userId: Type.string({ required: false }),
        password: Type.string({ required: true }),
        email: Type.string({ required: true }),
        firstName: Type.string({ required: false }),
        lastName: Type.string({ required: false }),
        profileImage: Type.object({ required: false }).of(
            UserFileUploadDocument
        ),
        address: Type.object({ required: false }).of(AddressDocument),
        contacts: Type.object({ required: false }).of(ContactsDocument),
        role: Type.string({ required: true }),
        disabled: Type.number({ required: true, default: 0 }),
        activated: Type.boolean({ required: true, default: false }),
        isAvailable: Type.boolean({ required: false, default: false }),
        preferredJobCategories: Type.array({ required: false }).of(
            Type.string({ required: false })
        ),
        availability: Type.array({ required: false }).of(
            Type.string({ required: false })
        ),
        experiences: Type.array({ required: false }).of(
            UserExperiencesDocument
        ),
        equipments: Type.array({ required: false }).of(UserEquipmentsDocument),
        acceptanceCriteria: Type.number({ required: true, default: 0 }), //distance from user location
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const UserSchema = typedModel("user", UserSchemaDocument);
