import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentMarks } from "@/pages/Marks";

interface MultiSubjectMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (marks: any) => void;
  editingMarks?: StudentMarks | null;
}

const students = [
  { name: "Emma Johnson", rollNo: "001", class: "Grade 10A" },
  { name: "Michael Chen", rollNo: "002", class: "Grade 10A" },
  { name: "Sarah Williams", rollNo: "003", class: "Grade 10B" },
  { name: "James Brown", rollNo: "004", class: "Grade 10A" },
  { name: "Lisa Davis", rollNo: "005", class: "Grade 10B" },
  { name: "David Wilson", rollNo: "006", class: "Grade 11A" },
  { name: "Jennifer Lee", rollNo: "007", class: "Grade 11A" },
  { name: "Robert Taylor", rollNo: "008", class: "Grade 11B" },
];

const subjects = ['Math', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];

export const MultiSubjectMarksModal = ({ isOpen, onClose, onSubmit, editingMarks }: MultiSubjectMarksModalProps) => {
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [marks, setMarks] = useState<Record<string, { obtained: string; total: string }>>({});

  useEffect(() => {
    if (editingMarks) {
      const student = students.find(s => s.name === editingMarks.studentName);
      setSelectedStudent(student || null);
      
      const marksData: Record<string, { obtained: string; total: string }> = {};
      subjects.forEach(subject => {
        if (editingMarks.subjects[subject]) {
          marksData[subject] = {
            obtained: editingMarks.subjects[subject].obtained.toString(),
            total: editingMarks.subjects[subject].total.toString(),
          };
        } else {
          marksData[subject] = { obtained: '', total: '100' };
        }
      });
      setMarks(marksData);
    } else {
      setSelectedStudent(null);
      const initialMarks: Record<string, { obtained: string; total: string }> = {};
      subjects.forEach(subject => {
        initialMarks[subject] = { obtained: '', total: '100' };
      });
      setMarks(initialMarks);
    }
  }, [editingMarks, isOpen]);

  const handleMarksChange = (subject: string, field: 'obtained' | 'total', value: string) => {
    setMarks(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: value
      }
    }));
  };

  const calculateTotals = () => {
    const totalObtained = subjects.reduce((sum, subject) => {
      return sum + (parseInt(marks[subject]?.obtained) || 0);
    }, 0);
    
    const totalPossible = subjects.reduce((sum, subject) => {
      return sum + (parseInt(marks[subject]?.total) || 0);
    }, 0);
    
    const percentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
    
    return { totalObtained, totalPossible, percentage };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    // Validate marks
    for (const subject of subjects) {
      const obtained = parseInt(marks[subject]?.obtained);
      const total = parseInt(marks[subject]?.total);
      
      if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0) {
        alert(`Please enter valid marks for ${subject}`);
        return;
      }
      
      if (obtained > total) {
        alert(`Marks obtained cannot be greater than total marks for ${subject}`);
        return;
      }
    }

    const subjectsData: Record<string, { obtained: number; total: number }> = {};
    subjects.forEach(subject => {
      subjectsData[subject] = {
        obtained: parseInt(marks[subject].obtained),
        total: parseInt(marks[subject].total),
      };
    });

    const marksData = {
      ...(editingMarks && { id: editingMarks.id }),
      studentName: selectedStudent.name,
      rollNo: selectedStudent.rollNo,
      class: selectedStudent.class,
      subjects: subjectsData,
    };

    onSubmit(marksData);
  };

  const { totalObtained, totalPossible, percentage } = calculateTotals();
  
  const isFormValid = selectedStudent && subjects.every(subject => 
    marks[subject]?.obtained && marks[subject]?.total &&
    parseInt(marks[subject].obtained) >= 0 && parseInt(marks[subject].total) > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle>
            {editingMarks ? 'Edit Student Marks' : 'Add Student Marks'}
          </DialogTitle>
          <DialogDescription>
            {editingMarks ? 'Update marks for all subjects.' : 'Enter marks for all subjects for the selected student.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <Select 
              value={selectedStudent?.name || ''} 
              onValueChange={(value) => {
                const student = students.find(s => s.name === value);
                setSelectedStudent(student || null);
              }}
              disabled={!!editingMarks}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.rollNo} value={student.name}>
                    {student.name} (Roll: {student.rollNo}, {student.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marks Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <Card key={subject}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{subject}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`${subject}-obtained`}>Marks Obtained</Label>
                      <Input
                        id={`${subject}-obtained`}
                        type="number"
                        min="0"
                        value={marks[subject]?.obtained || ''}
                        onChange={(e) => handleMarksChange(subject, 'obtained', e.target.value)}
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${subject}-total`}>Total Marks</Label>
                      <Input
                        id={`${subject}-total`}
                        type="number"
                        min="1"
                        value={marks[subject]?.total || '100'}
                        onChange={(e) => handleMarksChange(subject, 'total', e.target.value)}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  
                  {/* Subject percentage */}
                  {marks[subject]?.obtained && marks[subject]?.total && (
                    <div className="text-sm text-muted-foreground">
                      Percentage: {Math.round((parseInt(marks[subject].obtained) / parseInt(marks[subject].total)) * 100)}%
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          {isFormValid && (
            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-accent-foreground">{totalObtained}</p>
                    <p className="text-sm text-accent-foreground/70">Total Obtained</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent-foreground">{totalPossible}</p>
                    <p className="text-sm text-accent-foreground/70">Total Possible</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent-foreground">{percentage}%</p>
                    <p className="text-sm text-accent-foreground/70">Overall Percentage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              {editingMarks ? 'Update Marks' : 'Add Marks'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
