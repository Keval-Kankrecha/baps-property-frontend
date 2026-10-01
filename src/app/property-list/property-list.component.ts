import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';
import { PropertyService } from '../properties/property.service';
import { AttachedFile, COMES_UNDER_OPTIONS, Property, PropertyFilters, sqmToVar } from '../properties/property.model';

@Component({
  selector: 'app-property-list',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, NgTemplateOutlet],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css',
})
export class PropertyListComponent implements OnInit {
  private service = inject(PropertyService);
  private search$ = new Subject<void>();

  items = signal<Property[]>([]);
  total = signal(0);
  loading = signal(false);
  error = signal('');
  filters = signal<PropertyFilters>({ districts: [], talukas: [], purposes: [] });

  comesUnderOptions = COMES_UNDER_OPTIONS;
  query = { search: '', comesUnder: '', district: '', taluka: '', isNA: '', purpose: '' };
  page = 1;
  readonly limit = 20;

  yesNo: Record<string, string> = { yes: 'હા', no: 'ના' };
  readonly toVar = sqmToVar;
  fileUrl = (f: AttachedFile) => this.service.fileUrl(f);

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => this.reload());
    this.service.filters().subscribe({ next: (f) => this.filters.set(f), error: () => {} });
    this.load();
  }

  get pages(): number {
    return Math.max(1, Math.ceil(this.total() / this.limit));
  }

  onSearch(): void {
    this.search$.next();
  }

  reload(): void {
    this.page = 1;
    this.load();
  }

  clear(): void {
    this.query = { search: '', comesUnder: '', district: '', taluka: '', isNA: '', purpose: '' };
    this.reload();
  }

  go(page: number): void {
    this.page = page;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.list({ ...this.query, page: this.page, limit: this.limit }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.status === 0 ? 'સર્વર સાથે જોડાણ થઈ શક્યું નથી (backend ચાલુ છે?)' : 'યાદી લોડ થઈ શકી નથી');
      },
    });
  }

  remove(p: Property): void {
    if (!p._id || !confirm(`ક્રમ ${p.serialNo} (${p.village}) કાઢી નાખવું છે?`)) return;
    this.service.delete(p._id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('કાઢી નાખવામાં ભૂલ આવી'),
    });
  }
}
