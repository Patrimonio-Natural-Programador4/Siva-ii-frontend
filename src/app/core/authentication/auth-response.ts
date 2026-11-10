export function isMsalBridgeResponse(url: URL, redirectUri: string, isEmbedded: boolean): boolean {
  const redirect = new URL(redirectUri);
  return (
    isEmbedded &&
    url.origin === redirect.origin &&
    url.pathname === redirect.pathname &&
    (new URLSearchParams(url.hash.slice(1)).has('state') || url.searchParams.has('state'))
  );
}
