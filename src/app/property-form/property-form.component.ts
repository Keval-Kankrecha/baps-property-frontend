import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PropertyService } from '../properties/property.service';
import { AttachedFile, COMES_UNDER_OPTIONS, MAX_FILES, PURPOSE_OPTIONS, Property, YesNo, sqmToVar } from '../properties/property.model';

type FileField = 'propertyCardFiles' | 'assessmentFiles' | 'deedFiles';

@Component({
  selector: 'app-property-form',
  imports: [ReactiveFormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.css',
})
export class PropertyFormComponent implements OnInit {
  /** Route param from /edit/:id (bound via withComponentInputBinding) */
  id = input<string>();

  private fb = inject(FormBuilder);
  private service = inject(PropertyService);
  private router = inject(Router);

  purposeOptions = PURPOSE_OPTIONS;
  comesUnderOptions = COMES_UNDER_OPTIONS;
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  saved = signal('');
  uploading = signal<FileField | null>(null);
  readonly toVar = sqmToVar;
  readonly maxFiles = MAX_FILES;

  form = this.fb.nonNullable.group({
    serialNo: this.fb.control<number | null>(null, [Validators.min(1)]),
    propertyId: [''],
    comesUnder: [''],
    village: ['', Validators.required],
    taluka: [''],
    district: [''],
    surveyDetails: ['', Validators.required],
    deedNo: [''],
    deedDate: this.fb.control<string | null>(null),
    deedFiles: this.fb.nonNullable.control<AttachedFile[]>([]),
    giverNameAddress: [''],
    areaSqm: this.fb.control<number | null>(null, [Validators.min(0)]),
    in712: this.fb.nonNullable.control<YesNo>(''),
    propertyCard: [''],
    propertyCardFiles: this.fb.nonNullable.control<AttachedFile[]>([]),
    assessment: [''],
    assessmentFiles: this.fb.nonNullable.control<AttachedFile[]>([]),
    villageForm2: [''],
    purpose: [''],
    isNA: this.fb.nonNullable.control<YesNo>(''),
    naAreaSqm: this.fb.control<number | null>(null, [Validators.min(0)]),
    remarks: [''],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: (p) => {
        this.form.patchValue({ ...p, deedDate: p.deedDate ? p.deedDate.slice(0, 10) : null });
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }

  invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  filesOf(field: FileField): AttachedFile[] {
    return this.form.controls[field].value;
  }

  fileUrl(f: AttachedFile | null): string {
    return this.service.fileUrl(f);
  }

  onFile(field: FileField, event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = Array.from(input.files ?? []);
    input.value = '';
    if (!picked.length) return;
    const existing = this.filesOf(field);
    if (existing.length + picked.length > MAX_FILES) {
      this.error.set(`વધુમાં વધુ ${MAX_FILES} ફાઇલ જોડી શકાય (હાલ ${existing.length} છે)`);
      return;
    }
    this.error.set('');
    this.uploading.set(field);
    this.service.upload(picked).subscribe({
      next: (added) => {
        this.form.controls[field].setValue([...existing, ...added]);
        this.form.controls[field].markAsDirty();
        this.uploading.set(null);
      },
      error: (e: HttpErrorResponse) => {
        this.uploading.set(null);
        this.error.set(e.error?.message || 'ફાઇલ અપલોડ થઈ શકી નથી');
      },
    });
  }

  removeFile(field: FileField, index: number): void {
    this.form.controls[field].setValue(this.filesOf(field).filter((_, i) => i !== index));
    this.form.controls[field].markAsDirty();
  }

  save(addAnother = false): void {
    if (this.uploading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.saved.set('');
    const data = this.form.getRawValue() as Property;
    if (data.isNA !== 'yes') data.naAreaSqm = null;
    const id = this.id();
    const req = id ? this.service.update(id, data) : this.service.create(data);
    req.subscribe({
      next: (p) => {
        this.saving.set(false);
        if (addAnother) {
          this.form.reset();
          this.saved.set(`ક્રમ ${p.serialNo} સેવ થયું. હવે નવી મિલકત ઉમેરો.`);
          window.scrollTo({ top: 0 });
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (e) => this.fail(e),
    });
  }

  private fail(e: HttpErrorResponse): void {
    this.loading.set(false);
    this.saving.set(false);
    this.error.set(e.status === 0 ? 'સર્વર સાથે જોડાણ થઈ શક્યું નથી (backend ચાલુ છે?)' : e.error?.message || 'ભૂલ આવી');
  }
}
