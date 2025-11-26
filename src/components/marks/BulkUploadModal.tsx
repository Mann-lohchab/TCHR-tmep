import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any[]) => void;
}

export const BulkUploadModal = ({ isOpen, onClose, onUpload }: BulkUploadModalProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files[0]);
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Please upload a CSV or Excel file');
      setUploadStatus('error');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const processCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Student Name', 'Roll No', 'Class', 'Math', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];
    
    // Validate headers
    const hasRequiredHeaders = expectedHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );

    if (!hasRequiredHeaders) {
      throw new Error('CSV file must contain columns: Student Name, Roll No, Class, Math, Science, English, Social Studies, Hindi, Computer');
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Transform to our data structure
      const subjects = ['Math', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];
      const subjectsData: Record<string, { obtained: number; total: number }> = {};
      
      subjects.forEach(subject => {
        const marks = parseInt(rowData[subject]) || 0;
        subjectsData[subject] = { obtained: marks, total: 100 };
      });

      data.push({
        id: Date.now().toString() + i,
        studentName: rowData['Student Name'],
        rollNo: rowData['Roll No'],
        class: rowData['Class'],
        subjects: subjectsData,
      });
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('processing');
    
    try {
      const text = await file.text();
      const data = processCSV(text);
      
      onUpload(data);
      setUploadStatus('success');
      
      setTimeout(() => {
        onClose();
        setFile(null);
        setUploadStatus('idle');
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error processing file');
      setUploadStatus('error');
    }
  };

  const downloadTemplate = () => {
    const headers = ['Student Name', 'Roll No', 'Class', 'Math', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];
    const sampleData = [
      'Emma Johnson,001,Grade 10A,85,90,78,82,88,92',
      'Michael Chen,002,Grade 10A,92,88,85,79,90,87',
      'Sarah Williams,003,Grade 10B,78,85,90,88,82,85'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marks_template.csv';
    a.click();
    
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Marks</DialogTitle>
          <DialogDescription>
            Upload marks for multiple students using a CSV or Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Download Template</p>
                    <p className="text-sm text-muted-foreground">
                      Get the CSV template with sample data
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card>
            <CardContent 
              className={`p-8 border-2 border-dashed transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                
                {!file ? (
                  <>
                    <div>
                      <p className="text-lg font-medium">Drop your file here</p>
                      <p className="text-muted-foreground">or click to browse</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelection(e.target.files?.[0] as File)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Status Messages */}
          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'success' && (
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Marks uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Instructions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Download the template file to see the required format</li>
              <li>Fill in student information and marks for each subject</li>
              <li>Save as CSV or Excel file and upload here</li>
              <li>All marks should be numerical values</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploadStatus === 'processing'}
          >
            {uploadStatus === 'processing' ? 'Processing...' : 'Upload Marks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
