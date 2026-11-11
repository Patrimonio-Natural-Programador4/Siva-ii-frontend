import { isMsalBridgeResponse } from './auth-response';

describe('MSAL silent response routing', () => {
  const redirectUri = 'http://localhost:4200/auth/login';

  it('routes a silent iframe hash response to the bridge instead of bootstrapping Angular', () => {
    expect(
      isMsalBridgeResponse(new URL(`${redirectUri}#code=sample&state=sample`), redirectUri, true)
    ).toBeTrue();
  });

  it('supports query responses and error responses in an iframe or popup', () => {
    expect(
      isMsalBridgeResponse(new URL(`${redirectUri}?code=sample&state=sample`), redirectUri, true)
    ).toBeTrue();
    expect(
      isMsalBridgeResponse(
        new URL(`${redirectUri}#error=login_required&state=sample`),
        redirectUri,
        true
      )
    ).toBeTrue();
  });

  it('leaves normal top-level login redirects to the Angular MSAL wrapper', () => {
    expect(
      isMsalBridgeResponse(new URL(`${redirectUri}#code=sample&state=sample`), redirectUri, false)
    ).toBeFalse();
  });

  it('does not treat a regular embedded login page as an authentication response', () => {
    expect(isMsalBridgeResponse(new URL(redirectUri), redirectUri, true)).toBeFalse();
  });

  it('does not intercept responses on a different route or origin', () => {
    expect(
      isMsalBridgeResponse(
        new URL('http://localhost:4200/dashboard?state=sample'),
        redirectUri,
        true
      )
    ).toBeFalse();
    expect(
      isMsalBridgeResponse(
        new URL('https://example.com/auth/login?state=sample'),
        redirectUri,
        true
      )
    ).toBeFalse();
  });
});
