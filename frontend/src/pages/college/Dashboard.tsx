import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useToast, extractErrorMessage } from "../../lib/toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Badge, Card, EmptyState, FullPageSpinner, PageHeader, StatCard, Button } from "../../components/ui";
import {
  BookOpen,
  Activity,
  MapPin,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  department?: string;
  cgpa?: number;
  placementReadinessScore?: number;
}

export default function CollegeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [placement, setPlacement] = useState<any>(null);
  const [courseHealth, setCourseHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, studentsRes, placementRes, healthRes] = await Promise.all([
          api.get("/colleges/me"),
          api.get("/colleges/students"),
          api.get("/colleges/analytics/placements"),
          api.get("/curriculum/course-health"),
        ]);
        setProfile(profileRes.data.data);
        setStudents(studentsRes.data.data);
        setPlacement(placementRes.data.data);
        setCourseHealth(healthRes.data.data);
      } catch (err) {
        push(extractErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardLayout><FullPageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title={`${profile?.name ?? "College"} Institutional Dashboard`}
        subtitle="Manage curriculum alignment, course health, and training capacity."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/curriculum/alignment">
              <Button size="sm" className="gap-1.5">
                <BookOpen size={14} /> Audit Curriculum
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Enrolled Students" value={placement?.totalStudents ?? students.length} tone="brand" />
        <StatCard label="Avg Placement Rate" value={`${placement?.placementRate ?? 0}%`} tone="green" />
        <StatCard label="Avg Syllabus Alignment" value={`${courseHealth?.summary?.avgAlignmentScore ?? 85}%`} tone="brand" />
        <StatCard label="Oversupply Risk Alerts" value={courseHealth?.summary?.oversupplyCount ?? 0} tone="red" />
      </div>

      {/* Institutional Intelligence Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-brand-500" size={18} />
            <h3 className="font-bold text-sm text-ink">Curriculum Alignment</h3>
          </div>
          <p className="text-xs text-ink-muted mb-3">
            Compare syllabus skills against real-time market demand scores (0-100).
          </p>
          <Link to="/curriculum/alignment" className="text-xs font-semibold text-brand-600 hover:underline">
            Launch Alignment Engine →
          </Link>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-amber-500" size={18} />
            <h3 className="font-bold text-sm text-ink">Course Health & Oversupply</h3>
          </div>
          <p className="text-xs text-ink-muted mb-3">
            Detect low-absorption programs and seat oversupplies.
          </p>
          <Link to="/curriculum/course-health" className="text-xs font-semibold text-amber-600 hover:underline">
            View Health Matrix →
          </Link>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="text-indigo-500" size={18} />
            <h3 className="font-bold text-sm text-ink">Placement Outcomes Impact</h3>
          </div>
          <p className="text-xs text-ink-muted mb-3">
            Correlate curriculum coverage with graduate employment rates.
          </p>
          <Link to="/outcomes/placement-outcomes" className="text-xs font-semibold text-indigo-600 hover:underline">
            View Impact Analysis →
          </Link>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Linked Students</h2>
          <span className="text-xs text-ink-muted font-medium">{students.length} Registered</span>
        </div>
        {students.length === 0 ? (
          <div className="mt-4"><EmptyState title="No students linked yet" /></div>
        ) : (
          <div className="divide-y divide-stroke">
            {students.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.fullName}</p>
                  <p className="text-xs text-ink-faint">{s.department ?? "—"} · CGPA {s.cgpa ?? "—"}</p>
                </div>
                <Badge tone="brand">{s.placementReadinessScore ?? 0}% ready</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
