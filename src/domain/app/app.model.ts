export type AppPolicyOverride = {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    allowTools?: boolean;
    rateLimitPerMin?: number;
};

export type AppEntity = {
    _id?: any;
    apiKey?: string;
    appId: string;
    name: string;
    policy?: AppPolicyOverride;
    createdAt: Date;
    updatedAt: Date;
};
// we should store api keys array for future expansion
//then we would need to change the logic of the keys extraction and decryption
//it will probably be better to have a separate collection for api keys which will have details like createdAt, lastUsedAt, revokedAt, models allowed and etc...


//also we will have to add userId or ownerId field to link apps to users
