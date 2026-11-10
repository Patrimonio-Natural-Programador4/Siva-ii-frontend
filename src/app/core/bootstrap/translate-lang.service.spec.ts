import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, of, throwError } from 'rxjs';
import { SettingsService } from './settings.service';
import { TranslateLangService } from './translate-lang.service';

describe('TranslateLangService', () => {
  let service: TranslateLangService;
  let translate: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    translate = jasmine.createSpyObj('TranslateService', ['setFallbackLang', 'use']);
    translate.use.and.returnValue(of({}));
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslateService, useValue: translate },
        { provide: SettingsService, useValue: { getTranslateLang: () => 'es' } },
      ],
    });
    service = TestBed.inject(TranslateLangService);
  });

  it('loads the configured language', async () => {
    await service.load();

    expect(translate.setFallbackLang).toHaveBeenCalledWith('es');
    expect(translate.use).toHaveBeenCalledWith('es');
  });

  it('rejects on a translation failure rather than leaving startup pending', async () => {
    const error = new Error('Translation unavailable');
    translate.use.and.returnValue(throwError(() => error));

    await expectAsync(service.load()).toBeRejectedWith(error);
  });

  it('rejects after exactly 30 seconds if translations never respond', fakeAsync(() => {
    translate.use.and.returnValue(NEVER);
    let failure: Error | undefined;
    service.load().catch(error => (failure = error));

    tick(29_999);
    expect(failure).toBeUndefined();
    tick(1);
    expect(failure?.name).toBe('TimeoutError');
  }));
});
