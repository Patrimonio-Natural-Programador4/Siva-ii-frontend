import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './settings.service';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslateLangService {
  private readonly translate = inject(TranslateService);
  private readonly settings = inject(SettingsService);

  async load(): Promise<void> {
    const defaultLang = this.settings.getTranslateLang();

    this.translate.setFallbackLang(defaultLang);
    await firstValueFrom(this.translate.use(defaultLang).pipe(timeout({ first: 30_000 })));
  }
}
