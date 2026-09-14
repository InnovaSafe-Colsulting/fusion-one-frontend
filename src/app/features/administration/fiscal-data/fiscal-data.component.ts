import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FiscalDataService } from '../../../core/services/fiscal-data.service';
import { FiscalData } from '../../../core/models/fiscal-data.model';

@Component({
  selector: 'app-fiscal-data',
  standalone: true,
  imports: [],
  templateUrl: './fiscal-data.component.html',
  styleUrl: './fiscal-data.component.scss',
})
export class FiscalDataComponent implements OnInit {
  private fiscalDataService = inject(FiscalDataService);
  private router = inject(Router);

  fiscalData = signal<FiscalData | null>(null);
  loading = signal(true);
  showEmptyModal = signal(false);

  ngOnInit(): void {
    this.fiscalDataService.getFiscalData().subscribe(data => {
      console.log('[FiscalData]', data);
      this.loading.set(false);
      if (!data || !data.tax_id) {
        this.showEmptyModal.set(true);
      } else {
        this.fiscalData.set(data);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
