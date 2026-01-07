export type TokenEntity = {
    _id?: any;
    appId: string;
    label?: string;
    tokenHash: string;

    createdAt: Date;
    lastUsedAt?: Date | null;

    revokedAt?: Date | null;
};
