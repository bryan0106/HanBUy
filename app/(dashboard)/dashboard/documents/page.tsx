"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface Document {
  id: string;
  type: "proof_of_payment" | "id" | "other";
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verified: boolean;
  orderId?: string;
  invoiceId?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // TODO: Upload to backend
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newDoc: Document = {
      id: Date.now().toString(),
      type: "proof_of_payment",
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date(),
      verified: false,
    };

    setDocuments([newDoc, ...documents]);
    setUploading(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Documents</h1>

      {/* Upload Section */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Upload Document</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Document Type
            </label>
            <select className="w-full rounded-lg border border-border bg-background px-4 py-2">
              <option value="proof_of_payment">Proof of Payment</option>
              <option value="id">ID Document</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Select File</label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept="image/*,.pdf"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
            {uploading && (
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Uploaded Documents</h2>
        {documents.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-grey-100">
                    📄
                  </div>
                  <div>
                    <p className="font-semibold">{doc.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type.replace(/_/g, " ")} •{" "}
                      {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.verified ? (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      Pending
                    </span>
                  )}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-soft-blue-600 hover:underline text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

