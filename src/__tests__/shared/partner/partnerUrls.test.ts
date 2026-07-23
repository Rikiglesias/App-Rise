import {
  DONORBOX_DONATION_URL,
  buildDonorboxDonationUrl,
  appendRiseRef,
} from '@/shared/partner/partnerUrls';

describe('buildDonorboxDonationUrl', () => {
  it('mette il ref in utm_content e preserva show_content=true', () => {
    const url = buildDonorboxDonationUrl('REF123');
    expect(url).toContain('donorbox.org/embed/dona-ora-rah');
    expect(url).toContain('show_content=true');
    expect(url).toContain('utm_content=REF123');
    // separatore & perché la base ha già ?show_content=true
    expect(url).toBe(`${DONORBOX_DONATION_URL}&utm_content=REF123`);
  });

  it('ref null/undefined → nessun utm_content (donazione ospite, base invariata)', () => {
    expect(buildDonorboxDonationUrl(null)).toBe(DONORBOX_DONATION_URL);
    expect(buildDonorboxDonationUrl(undefined)).toBe(DONORBOX_DONATION_URL);
  });

  it('aggiunge i campi di prefill anagrafici', () => {
    const url = buildDonorboxDonationUrl('REF', {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario@rise.it',
    });
    expect(url).toContain('first_name=Mario');
    expect(url).toContain('last_name=Rossi');
    expect(url).toContain('email=mario%40rise.it');
    expect(url).toContain('utm_content=REF');
  });

  it('salta i campi prefill vuoti/null (email non risolta = niente email in URL)', () => {
    const url = buildDonorboxDonationUrl('REF', {
      firstName: 'Mario',
      lastName: null,
      email: null,
    });
    expect(url).toContain('first_name=Mario');
    expect(url).not.toContain('last_name=');
    expect(url).not.toContain('email=');
  });

  it('encoda caratteri speciali nei valori (spazio, &)', () => {
    const url = buildDonorboxDonationUrl('a b&c', { firstName: 'De Rossi' });
    expect(url).toContain('utm_content=a%20b%26c');
    expect(url).toContain('first_name=De%20Rossi');
  });

  it('accetta una base override (futuro swap alla pagina ospitata)', () => {
    const url = buildDonorboxDonationUrl(
      'REF',
      {},
      'https://donorbox.org/dona-ora-rah'
    );
    expect(url).toBe('https://donorbox.org/dona-ora-rah?utm_content=REF');
  });
});

describe('appendRiseRef', () => {
  it('aggiunge rise_ref a un URL senza query', () => {
    expect(
      appendRiseRef('https://x.letsdonation.com/charity/ecommerce', 'REF')
    ).toBe('https://x.letsdonation.com/charity/ecommerce?rise_ref=REF');
  });

  it('preserva una query esistente (es. ?redirect= del community register)', () => {
    const url =
      'https://riseagainsthunger.org.letsdonation.com/register?redirect=https%3A%2F%2Fexample.com';
    const out = appendRiseRef(url, 'REF');
    expect(out).toContain('redirect=https%3A%2F%2Fexample.com');
    expect(out).toContain('&rise_ref=REF');
  });

  it('ref null/undefined → URL invariato (ospite, nessuna regressione)', () => {
    const url = 'https://x.letsdonation.com/charity/ecommerce';
    expect(appendRiseRef(url, null)).toBe(url);
    expect(appendRiseRef(url, undefined)).toBe(url);
  });
});
