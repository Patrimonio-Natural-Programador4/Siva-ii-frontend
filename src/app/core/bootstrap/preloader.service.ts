import { Injectable, inject, DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreloaderService {
  private readonly document = inject(DOCUMENT);

  private readonly selector = 'globalLoader';

  private getElement() {
    return this.document.getElementById(this.selector);
  }

  hide() {
    const el = this.getElement();
    if (!el || el.classList.contains('global-loader-hidden')) {
      return;
    }

    const finish = () => {
      el.className = 'global-loader-hidden';
      el.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(fallback);
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === el && event.propertyName === 'opacity') {
        finish();
      }
    };
    // Hidden tabs and disabled animations may never emit transitionend.
    const fallback = setTimeout(finish, 600);
    el.addEventListener('transitionend', onTransitionEnd);
    el.style.pointerEvents = 'none';
    el.classList.add('global-loader-fade-out');
  }
}
