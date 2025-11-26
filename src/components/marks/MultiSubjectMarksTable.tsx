import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, FileDown } from "lucide-react";
import type { StudentMarks } from "@/pages/Marks";

interface MultiSubjectMarksTableProps {
  marks: StudentMarks[];
  onEdit: (marks: StudentMarks) => void;
  onDelete: (id: string) => void;
  onGenerateReport: (studentId: string) => void;
}

const subjects = ['Math', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer'];

const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-success text-success-foreground';
  if (percentage >= 80) return 'bg-primary text-primary-foreground';
  if (percentage >= 70) return 'bg-warning text-warning-foreground';
  if (percentage >= 60) return 'bg-orange-500 text-white';
  return 'bg-destructive text-destructive-foreground';
};

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const MultiSubjectMarksTable = ({ marks, onEdit, onDelete, onGenerateReport }: MultiSubjectMarksTableProps) => {
  if (marks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No marks found. Add some marks to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Marks Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Student Info</TableHead>
                {subjects.map(subject => (
                  <TableHead key={subject} className="text-center min-w-20">
                    {subject}
                  </TableHead>
                ))}
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.map((studentMarks) => {
                const totalObtained = Object.values(studentMarks.subjects).reduce((sum, mark) => sum + mark.obtained, 0);
                const totalPossible = Object.values(studentMarks.subjects).reduce((sum, mark) => sum + mark.total, 0);
                const percentage = Math.round((totalObtained / totalPossible) * 100);
                const grade = getGrade(percentage);

                return (
                  <TableRow key={studentMarks.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{studentMarks.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Roll: {studentMarks.rollNo} • {studentMarks.class}
                        </p>
                      </div>
                    </TableCell>
                    
                    {subjects.map(subject => {
                      const subjectMark = studentMarks.subjects[subject];
                      const subjectPercentage = Math.round((subjectMark.obtained / subjectMark.total) * 100);
                      
                      return (
                        <TableCell key={subject} className="text-center">
                          <div className="text-sm">
                            <div className="font-semibold">
                              {subjectMark.obtained}/{subjectMark.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {subjectPercentage}%
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-center">
                      <div className="font-semibold text-foreground">
                        {totalObtained}/{totalPossible}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="font-semibold text-foreground">
                        {percentage}%
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge className={getGradeColor(percentage)}>
                        {grade}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(studentMarks)}
                          className="h-8 w-8 p-0"
                          title="Edit marks"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onGenerateReport(studentMarks.id)}
                          className="h-8 w-8 p-0"
                          title="Generate report"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(studentMarks.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete marks"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
