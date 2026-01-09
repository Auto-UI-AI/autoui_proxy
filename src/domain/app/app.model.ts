export type AppPolicyOverride = {
    model?: string;
    primaryModel?: string; 
    maxTokens?: number;
    temperature?: number;
    allowTools?: boolean;
    rateLimitPerMin?: number;
};

export type AppEntity = {
    _id?: any;
    appId: string;
    name: string;
    userId: string; 
    openRouterApiKey?: string; 
    sharedSecret: string;
    policy?: AppPolicyOverride;
    createdAt: Date;
    updatedAt: Date;
};
