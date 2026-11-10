import { DOCUMENT } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PreloaderService } from './preloader.service';

describe('PreloaderService', () => {
  let service: PreloaderService;
  let document: Document;
  let loader: HTMLDivElement;

  beforeEach(() => {
    service = TestBed.inject(PreloaderService);
    document = TestBed.inject(DOCUMENT);
    loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'global-loader';
    document.body.appendChild(loader);
  });

  afterEach(() => loader.remove());

  it('does not throw when there is no loader', () => {
    loader.remove();
    expect(() => service.hide()).not.toThrow();
  });

  it('immediately stops intercepting clicks and preserves the fade animation', fakeAsync(() => {
    service.hide();
    expect(loader.style.pointerEvents).toBe('none');
    expect(loader.classList.contains('global-loader-fade-out')).toBeTrue();
    tick(600);
  }));

  it('removes the overlay after 600 ms even if a hidden tab never emits transitionend', fakeAsync(() => {
    service.hide();
    tick(599);
    expect(loader.classList.contains('global-loader-hidden')).toBeFalse();
    tick(1);
    expect(loader.className).toBe('global-loader-hidden');
  }));

  it('hides as soon as the opacity transition ends', fakeAsync(() => {
    service.hide();
    loader.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'opacity' }));
    expect(loader.className).toBe('global-loader-hidden');
    tick(600);
    expect(loader.className).toBe('global-loader-hidden');
  }));

  it('ignores transitions from child elements and unrelated properties', fakeAsync(() => {
    const child = document.createElement('span');
    loader.appendChild(child);
    service.hide();
    child.dispatchEvent(
      new TransitionEvent('transitionend', { bubbles: true, propertyName: 'opacity' })
    );
    loader.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'color' }));
    expect(loader.classList.contains('global-loader-hidden')).toBeFalse();
    tick(600);
    expect(loader.className).toBe('global-loader-hidden');
  }));

  it('does not change an already hidden loader', fakeAsync(() => {
    loader.className = 'global-loader-hidden';
    service.hide();
    tick(600);
    expect(loader.className).toBe('global-loader-hidden');
    expect(loader.style.pointerEvents).toBe('');
  }));
});
