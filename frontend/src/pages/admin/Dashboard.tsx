import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useToast, extractErrorMessage } from "../../lib/toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Badge, Card, FullPageSpinner, PageHeader, StatCard, Button } from "../../components/ui";
import {
  Globe,
  MapPin,
  BookOpen,
  Activity,
  FileCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [courseHealth, setCourseHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [a, r, m, c] = await Promise.all([
          api.get("/admin/analytics/platform"),
          api.get("/admin/monitoring/recent-activity"),
          api.get("/labour-market/overview"),
          api.get("/curriculum/course-health"),
        ]);
        setAnalytics(a.data.data);
        setActivity(r.data.data);
        setMarket(m.data.data);
        setCourseHealth(c.data.data);
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
        title="National Labour Market & Institutional Intelligence Console"
        subtitle="SIH26134 Central Command for Government, Universities, and District Skill Committees."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/labour-market">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Globe size={14} /> Market Monitor
              </Button>
            </Link>
            <Link to="/district-training-plans">
              <Button size="sm" variant="outline" className="gap-1.5">
                <FileCheck size={14} /> District Plans
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary SIH KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tracked Job Openings"
          value={market?.metrics?.totalHiringVolume?.toLocaleString() ?? 0}
          tone="brand"
          hint="Across Indian industrial clusters"
        />
        <StatCard
          label="Avg Sector Growth"
          value={`+${market?.metrics?.avgGrowthRate ?? 0}%`}
          tone="green"
          hint="Year-over-Year expansion"
        />
        <StatCard
          label="Syllabus Update Alerts"
          value={courseHealth?.summary?.needsUpdateCount ?? 0}
          tone="amber"
          hint="Programs needing modernization"
        />
        <StatCard
          label="Oversupply Risk Programs"
          value={courseHealth?.summary?.oversupplyCount ?? 0}
          tone="red"
          hint="Low placement vs high capacity"
        />
      </div>

      {/* SIH Intelligence Command Navigation Matrix */}
      <Card className="mt-6 p-6 border-indigo-200 dark:border-indigo-900 bg-surface-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink">SIH26134 Core Intelligence Modules</h2>
            <p className="text-xs text-ink-muted">Quick access to policy, curriculum, and district planning engines</p>
          </div>
          <Badge variant="primary">Government & Institutional Console</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/labour-market"
            className="p-4 rounded-xl border border-stroke bg-surface-2 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
          >
            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
              <Globe size={16} /> Labour Market Intel
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Top demanded roles, emerging skills, and real-time demand scoring.
            </p>
          </Link>

          <Link
            to="/district-intelligence"
            className="p-4 rounded-xl border border-stroke bg-surface-2 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <MapPin size={16} /> District Capacity
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Certified faculty deficits, equipment gaps, and capital planning.
            </p>
          </Link>

          <Link
            to="/curriculum/alignment"
            className="p-4 rounded-xl border border-stroke bg-surface-2 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <BookOpen size={16} /> Curriculum Alignment
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Syllabus gap scoring, missing industry skills, and modernization paths.
            </p>
          </Link>

          <Link
            to="/outcomes/placement-outcomes"
            className="p-4 rounded-xl border border-stroke bg-surface-2 hover:border-amber-500 hover:bg-amber-50/30 transition-all group"
          >
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <GraduationCap size={16} /> Placement Outcomes
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Correlate syllabus skill alignment with graduate hiring rates.
            </p>
          </Link>
        </div>
      </Card>

      {/* Platform & Activity Monitoring */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-semibold text-ink">Recent Users</h2>
          <div className="mt-3 divide-y divide-stroke">
            {(activity?.recentUsers ?? []).map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate text-ink">{u.email}</span>
                <Badge tone="brand">{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Recent Applications</h2>
          <div className="mt-3 divide-y divide-stroke">
            {(activity?.recentApplications ?? []).map((a: any) => (
              <div key={a.id} className="py-2.5 text-sm">
                <p className="text-ink font-medium">{a.student?.fullName}</p>
                <p className="text-xs text-ink-faint">applied to {a.opportunity?.title}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Recent Job Signals</h2>
          <div className="mt-3 divide-y divide-stroke">
            {(activity?.recentOpportunities ?? []).map((o: any) => (
              <div key={o.id} className="py-2.5 text-sm">
                <p className="text-ink font-medium">{o.title}</p>
                <p className="text-xs text-ink-faint">{o.company?.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
