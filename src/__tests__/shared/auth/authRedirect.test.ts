import {
  parseAuthRedirect,
  isRecoveryRedirect,
  buildResetRedirectTo,
  RESET_PASSWORD_PATH,
} from '@/shared/auth/authRedirect';

describe('authRedirect.parseAuthRedirect', () => {
  it('estrae type/access_token/refresh_token dal fragment di recovery', () => {
    const url =
      'rahitalia://reset-password#access_token=AAA&refresh_token=BBB&type=recovery&expires_in=3600';
    const p = parseAuthRedirect(url);
    expect(p.type).toBe('recovery');
    expect(p.access_token).toBe('AAA');
    expect(p.refresh_token).toBe('BBB');
  });

  it('ritorna {} se non c’è fragment', () => {
    expect(parseAuthRedirect('rahitalia://reset-password')).toEqual({});
  });

  it('ritorna {} se il fragment è vuoto', () => {
    expect(parseAuthRedirect('rahitalia://reset-password#')).toEqual({});
  });

  it('decodifica i valori URL-encoded', () => {
    const p = parseAuthRedirect(
      'app://x#error_description=Token%20has%20expired&error_code=401'
    );
    expect(p.error_description).toBe('Token has expired');
    expect(p.error_code).toBe('401');
  });
});

describe('authRedirect.isRecoveryRedirect', () => {
  it('true solo se type=recovery con entrambi i token', () => {
    expect(
      isRecoveryRedirect('app://r#type=recovery&access_token=A&refresh_token=B')
    ).toBe(true);
  });

  it('false se manca un token', () => {
    expect(isRecoveryRedirect('app://r#type=recovery&access_token=A')).toBe(
      false
    );
  });

  it('false se il type non è recovery (es. magic link)', () => {
    expect(
      isRecoveryRedirect(
        'app://r#type=magiclink&access_token=A&refresh_token=B'
      )
    ).toBe(false);
  });
});

describe('authRedirect.buildResetRedirectTo', () => {
  it('costruisce il deep link sul path di reset', () => {
    // expo-linking è mockato globalmente: createURL(path) => `rahitalia://${path}`
    expect(buildResetRedirectTo()).toBe(`rahitalia://${RESET_PASSWORD_PATH}`);
  });
});
