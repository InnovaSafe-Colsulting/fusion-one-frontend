import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { SLUG_ROUTE_MAP, SLUG_ICON_MAP } from './nav-items';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem, MenuItemChild } from '../../core/models/menu.models';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private menuService = inject(MenuService);
  private router = inject(Router);

  collapsed = input(false);
  closeSidebar = output();

  navItems = signal<MenuItem[]>([]);
  expandedItem = signal<number | null>(null);
  activeSlug = signal<string | null>(null);

  private readonly HIDDEN_SLUGS = new Set(['billing']);

  private filterMenu(items: MenuItem[]): MenuItem[] {
    return items.map(item => ({
      ...item,
      children: item.children
        ?.filter(c => !this.HIDDEN_SLUGS.has(c.slug))
        .map(c => ({
          ...c,
          children: c.children?.filter(sc => !this.HIDDEN_SLUGS.has(sc.slug)),
        })),
    }));
  }

  ngOnInit(): void {
    this.menuService.getMenu().subscribe({
      next: items => {
        console.log('[Menu] items:', items);
        this.navItems.set(this.filterMenu(items));
      },
      error: err => {
        console.error('[Menu] error:', err);
        this.navItems.set([]);
      },
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.syncActiveSlug(e.urlAfterRedirects);
    });

    this.syncActiveSlug(this.router.url);
  }

  private syncActiveSlug(url: string): void {
    const path = url.split('?')[0];
    const match = Object.entries(SLUG_ROUTE_MAP).find(([, route]) => route === path);
    this.activeSlug.set(match ? match[0] : null);
  }

  toggleItem(id: number): void {
    this.expandedItem.update(v => v === id ? null : id);
  }

  selectSlug(slug: string): void {
    this.activeSlug.set(slug);
    this.closeSidebar.emit();
  }

  hasChildren(item: MenuItem | MenuItemChild): boolean {
    return !!item.children?.length;
  }

  getRoute(slug: string): string {
    return SLUG_ROUTE_MAP[slug] ?? '/dashboard';
  }

  getIcon(slug: string): string {
    return SLUG_ICON_MAP[slug] ?? '📄';
  }

  isActive(slug: string): boolean {
    return this.activeSlug() === slug;
  }
}
