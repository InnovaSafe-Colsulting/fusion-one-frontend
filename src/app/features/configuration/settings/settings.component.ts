import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CompanyService } from '../../../core/services/company.service';
import { FiscalDataService } from '../../../core/services/fiscal-data.service';
import { CityService } from '../../../core/services/city.service';
import { City } from '../../../core/models/city.model';
import { FiscalData } from '../../../core/models/fiscal-data.model';
import { Tenant } from '../../../core/models/company.model';

type Status = 'idle' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private companyService  = inject(CompanyService);
  private fiscalService   = inject(FiscalDataService);
  private cityService     = inject(CityService);

  activeTab     = signal<'general' | 'fiscal'>('general');
  loading       = signal(true);
  cities        = signal<City[]>([]);
  logoUrl       = signal<string | null>(null);
  logoPreview   = signal<string | null>(null);
  logoFile      = signal<File | null>(null);
  confirmDelete = signal(false);

  generalStatus = signal<Status>('idle');
  fiscalStatus  = signal<Status>('idle');
  logoStatus    = signal<Status>('idle');

  generalForm = this.fb.group({
    name:             [''],
    commercial_name:  [''],
    legal_name:       [''],
    email:            ['', Validators.email],
    phone:            [''],
    address:          [''],
    neighboarhood:    [''],
    timezone:         [''],
    city_id:          [null as number | null],
  });

  fiscalForm = this.fb.group({
    tax_id:             [''],
    verification_digit: [''],
    tax_regime:         [''],
    fiscal_address:     [''],
  });

  ngOnInit(): void {
    forkJoin({
      company: this.companyService.getCompany(),
      fiscal:  this.fiscalService.getFiscalData(),
      cities:  this.cityService.getCities(),
    }).subscribe(({ company, fiscal, cities }) => {
      this.cities.set(cities);

      if (company?.tenant) {
        const t = company.tenant;
        this.generalForm.patchValue({
          name:            t.name,
          commercial_name: t.commercial_name,
          legal_name:      t.legal_name,
          email:           t.email,
          phone:           t.phone,
          address:         t.address,
          neighboarhood:   t.neighboarhood,
          timezone:        t.timezone,
          city_id:         t.city_id,
        });
        this.logoUrl.set(t.logo);
      }

      if (fiscal?.tax_id) {
        this.fiscalForm.patchValue({
          tax_id:             fiscal.tax_id,
          verification_digit: fiscal.verification_digit,
          tax_regime:         fiscal.tax_regime,
          fiscal_address:     fiscal.fiscal_address,
        });
      }

      this.loading.set(false);
    });
  }

  setTab(tab: 'general' | 'fiscal'): void {
    this.activeTab.set(tab);
  }

  // ── Logo ──────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  saveLogo(): void {
    const file = this.logoFile();
    if (!file) return;
    this.logoStatus.set('saving');
    this.companyService.uploadLogo(file).subscribe({
      next: res => {
        this.logoUrl.set(res.logo);
        this.logoPreview.set(null);
        this.logoFile.set(null);
        this.logoStatus.set('success');
        setTimeout(() => this.logoStatus.set('idle'), 3000);
      },
      error: err => {
        console.error('[Logo] error:', err);
        this.logoStatus.set('error');
        setTimeout(() => this.logoStatus.set('idle'), 3000);
      },
    });
  }

  deleteLogo(): void {
    this.logoStatus.set('saving');
    this.companyService.deleteLogo().subscribe({
      next: () => {
        this.logoUrl.set(null);
        this.logoPreview.set(null);
        this.logoFile.set(null);
        this.confirmDelete.set(false);
        this.logoStatus.set('idle');
      },
      error: () => {
        this.logoStatus.set('error');
        setTimeout(() => this.logoStatus.set('idle'), 3000);
      },
    });
  }

  // ── General ───────────────────────────────────────────
  saveGeneral(): void {
    if (this.generalForm.invalid) return;
    this.generalStatus.set('saving');
    this.companyService.updateCompany(this.generalForm.value as Partial<Tenant>).subscribe({
      next: () => {
        this.generalStatus.set('success');
        setTimeout(() => this.generalStatus.set('idle'), 3000);
      },
      error: () => {
        this.generalStatus.set('error');
        setTimeout(() => this.generalStatus.set('idle'), 3000);
      },
    });
  }

  // ── Fiscal ────────────────────────────────────────────
  saveFiscal(): void {
    this.fiscalStatus.set('saving');
    this.fiscalService.updateFiscalData(this.fiscalForm.value as Partial<FiscalData>).subscribe({
      next: () => {
        this.fiscalStatus.set('success');
        setTimeout(() => this.fiscalStatus.set('idle'), 3000);
      },
      error: () => {
        this.fiscalStatus.set('error');
        setTimeout(() => this.fiscalStatus.set('idle'), 3000);
      },
    });
  }

  deleteFiscal(): void {
    this.fiscalStatus.set('saving');
    this.fiscalService.deleteFiscalData().subscribe({
      next: () => {
        this.fiscalForm.reset();
        this.fiscalStatus.set('idle');
      },
      error: () => {
        this.fiscalStatus.set('error');
        setTimeout(() => this.fiscalStatus.set('idle'), 3000);
      },
    });
  }
}
