import { Component, inject, output } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (modal.isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal modal--{{ modal.config().size ?? 'md' }}" role="dialog">
          <div class="modal__header">
            <h2 class="modal__title">{{ modal.config().title }}</h2>
            <button class="modal__close" (click)="modal.close()" aria-label="Cerrar">✕</button>
          </div>
          <div class="modal__body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  modal = inject(ModalService);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modal.close();
    }
  }
}
