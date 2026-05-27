import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { uploadDataset } from '../lib/api';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setStatus('در حال بارگذاری فایل...');

    try {
      await uploadDataset(file);
      setStatus('فایل با موفقیت بارگذاری شد.');
    } catch {
      setStatus('بارگذاری فایل ناموفق بود.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="file-upload">
      <label className="upload-button">
        {isUploading ? <Loader2 className="spin" size={18} /> : <FileUp size={18} />}
        <span>بارگذاری فایل</span>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {status && <span className="upload-status">{status}</span>}
    </div>
  );
}