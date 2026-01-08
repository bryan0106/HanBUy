import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  type: 'id' | 'proof_of_address' | 'payment_proof' | 'other';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GetDocumentsParams {
  type?: 'id' | 'proof_of_address' | 'payment_proof' | 'other';
  page?: number;
  limit?: number;
}

export interface GetDocumentsResponse {
  success: boolean;
  data: Document[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetDocumentResponse {
  success: boolean;
  data: Document;
}

export interface UploadDocumentRequest {
  file: File;
  type: 'id' | 'proof_of_address' | 'payment_proof' | 'other';
  description?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message?: string;
}

export const documentService = {
  /**
   * Upload document (multipart/form-data)
   */
  async uploadDocument(data: UploadDocumentRequest): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await apiClient.post<UploadDocumentResponse>(
        '/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user documents with optional filters
   */
  async getDocuments(params?: GetDocumentsParams): Promise<GetDocumentsResponse> {
    try {
      const response = await apiClient.get<GetDocumentsResponse>('/documents', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single document by ID
   */
  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await apiClient.get<GetDocumentResponse>(`/documents/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete<DeleteDocumentResponse>(`/documents/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
