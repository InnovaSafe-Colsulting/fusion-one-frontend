import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { CompanyResponse } from '../../../core/models/company.model';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
})
export class CompanyComponent implements OnInit {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  companyData = signal<CompanyResponse | null>(null);
  loading = signal(true);

  initials = computed(() => {
    const name = this.companyData()?.tenant.name ?? '';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  });

  ngOnInit(): void {
    this.companyService.getCompany().subscribe(data => {
      this.companyData.set(data);
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
