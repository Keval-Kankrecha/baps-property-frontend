import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AttachedFile, Property, PropertyFilters, PropertyPage } from './property.model';

export const API_URL = 'https://baps-property-backend.onrender.com/api/properties';
export const UPLOAD_URL = 'https://baps-property-backend.onrender.com/api/uploads';
export const FILES_URL = 'https://baps-property-backend.onrender.com/files';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);

  list(query: Record<string, string | number>): Observable<PropertyPage> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== '' && v != null) params = params.set(k, String(v));
    }
    return this.http.get<PropertyPage>(API_URL, { params });
  }

  filters(): Observable<PropertyFilters> {
    return this.http.get<PropertyFilters>(`${API_URL}/filters`);
  }

  get(id: string): Observable<Property> {
    return this.http.get<Property>(`${API_URL}/${id}`);
  }

  create(data: Property): Observable<Property> {
    return this.http.post<Property>(API_URL, data);
  }

  update(id: string, data: Property): Observable<Property> {
    return this.http.put<Property>(`${API_URL}/${id}`, data);
  }

  upload(files: File[]): Observable<AttachedFile[]> {
    const body = new FormData();
    for (const f of files) body.append('files', f);
    return this.http.post<AttachedFile[]>(UPLOAD_URL, body);
  }

  fileUrl(f: AttachedFile | null | undefined): string {
    return f ? `${FILES_URL}/${f.fileName}` : '';
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
