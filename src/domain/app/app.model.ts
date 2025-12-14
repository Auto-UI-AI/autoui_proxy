export type AppPolicyOverride = {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    allowTools?: boolean;
    rateLimitPerMin?: number;
};

export type AppEntity = {
    _id?: any;
    appId: string;
    name: string;
    policy?: AppPolicyOverride;
    createdAt: Date;
    updatedAt: Date;
};
