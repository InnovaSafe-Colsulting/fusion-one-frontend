import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.isOpen()) {
      <div class="modal-backdrop">
        <div class="confirm-dialog" role="alertdialog">
          <h3 class="confirm-dialog__title">{{ dialog.config().title }}</h3>
          <p class="confirm-dialog__message">{{ dialog.config().message }}</p>
          <div class="confirm-dialog__actions">
            <button class="btn btn-ghost" (click)="dialog.cancel()">
              {{ dialog.config().cancelLabel ?? 'Cancelar' }}
            </button>
            <button
              class="btn"
              [class.btn-danger]="dialog.config().danger"
              [class.btn-primary]="!dialog.config().danger"
              (click)="dialog.accept()"
            >
              {{ dialog.config().confirmLabel ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  dialog = inject(ConfirmDialogService);
}
