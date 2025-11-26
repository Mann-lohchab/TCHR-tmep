import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  Award,
  Settings,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();

  const teacherProfile = {
    name: "Sarah Anderson",
    email: "sarah.anderson@school.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Education St, Learning City, LC 12345",
    joinDate: "September 2019",
    employeeId: "TCH-2019-045",
    department: "Mathematics & Science",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    grades: ["Grade 9", "Grade 10", "Grade 11"],
    totalStudents: 128,
    completedAssignments: 245,
    yearsExperience: 8
  };

  const achievements = [
    { title: "Teacher of the Year 2023", date: "December 2023" },
    { title: "Excellence in STEM Education", date: "June 2023" },
    { title: "Innovation in Teaching", date: "March 2022" }
  ];

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Opening profile editor...",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Opening settings panel...",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Logging out...",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/teacher-profile.jpg" alt={teacherProfile.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {teacherProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">{teacherProfile.name}</h1>
              <p className="text-muted-foreground">{teacherProfile.department}</p>
              <Badge className="mt-2 bg-primary text-primary-foreground">
                {teacherProfile.yearsExperience} Years Experience
              </Badge>
            </div>

            <div className="flex gap-3 w-full">
              <Button 
                onClick={handleEditProfile}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary-dark"
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSettings}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{teacherProfile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{teacherProfile.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{teacherProfile.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">Joined {teacherProfile.joinDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">ID: {teacherProfile.employeeId}</span>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Teaching Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{teacherProfile.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{teacherProfile.completedAssignments}</div>
              <div className="text-sm text-muted-foreground">Assignments Created</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subjects
              </h4>
              <div className="flex flex-wrap gap-2">
                {teacherProfile.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Grades
              </h4>
              <div className="flex flex-wrap gap-2">
                {teacherProfile.grades.map((grade) => (
                  <Badge key={grade} variant="outline">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <Award className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full min-h-touch text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
