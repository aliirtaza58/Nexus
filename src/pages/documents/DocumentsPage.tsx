import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FileText, Upload, Trash2, FileSignature } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/api/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load documents');
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const res = await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Document uploaded');
        fetchDocs();
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSign = async (id: string) => {
    try {
      const res = await axios.put(`/api/documents/${id}/sign`, {
        signatureUrl: 'https://example.com/mock-signature.png'
      });
      if (res.data.success) {
        toast.success('Document signed!');
        fetchDocs();
      }
    } catch (error) {
      toast.error('Failed to sign document');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button leftIcon={<Upload size={18} />} disabled={isUploading}>
            {isDragActive ? 'Drop file here' : isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Recent Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Starred
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Trash
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Sort by
                </Button>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">No documents found. Drag and drop to upload.</p>
                ) : (
                  documents.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            <a href={`http://localhost:5000/uploads/${doc.filename}`} target="_blank" rel="noreferrer" className="hover:underline">
                              {doc.originalName}
                            </a>
                          </h3>
                          <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'} size="sm">
                            {doc.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Version {doc.version}</span>
                          <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {doc.status === 'pending_signature' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-2 flex items-center gap-1"
                            onClick={() => handleSign(doc._id)}
                          >
                            <FileSignature size={14} /> Sign
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};