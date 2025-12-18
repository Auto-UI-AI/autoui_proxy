export function corsHeaders(origin?: string): Headers {
    const headers = new Headers();

    headers.set("Access-Control-Allow-Origin", origin ?? "*");
    headers.set("Vary", "Origin");

    headers.set(
        "Access-Control-Allow-Headers",
        "content-type, x-autoui-app-id, x-autoui-secret, authorization"
    );

    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");

    headers.set("Cache-Control", "no-cache");

    return headers;
}
