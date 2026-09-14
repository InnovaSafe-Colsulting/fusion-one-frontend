import { Component, inject, output, input, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { BranchService } from '../../core/services/branch.service';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private authService   = inject(AuthService);
  private branchService = inject(BranchService);

  pageTitle    = input('Dashboard');
  pageSubtitle = input('Resumen general de tu negocio en tiempo real');
  toggleSidebar = output();

  today         = new Date();
  notifications = 5;
  branches      = signal<Branch[]>([]);
  selectedBranch = signal<number | null>(null);

  ngOnInit(): void {
    this.branchService.getActiveBranches().subscribe(data => {
      this.branches.set(data);
      if (data.length > 0) this.selectedBranch.set(data[0].id);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
