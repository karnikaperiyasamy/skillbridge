import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useToast, extractErrorMessage } from "../../lib/toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, FullPageSpinner, PageHeader, StatCard, Badge, Button } from "../../components/ui";
import {
  Globe,
  TrendingUp,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  matchScore?: number;
  opportunity: { title: string; type: string; company: { name: string } };
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, appsRes, readinessRes, marketRes] = await Promise.all([
          api.get("/students/me"),
          api.get("/students/applications"),
          api.get("/ai/readiness-score"),
          api.get("/labour-market/overview"),
        ]);
        setProfile(profileRes.data.data);
        setApplications(appsRes.data.data);
        setReadiness(readinessRes.data.data.placementReadinessScore);
        setMarket(marketRes.data.data);
      } catch (err) {
        push(extractErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardLayout><FullPageSpinner /></DashboardLayout>;

  const userSkillNames = new Set((profile?.skills ?? []).map((s: any) => s.skill?.name?.toLowerCase()));
  const topDemandedSkills = market?.topSkills?.slice(0, 6) ?? [];
  const missingRegionalSkills = topDemandedSkills.filter((s: any) => !userSkillNames.has(s.skill.toLowerCase()));

  const skillCount = profile?.skills?.length ?? 0;
  const activeApplications = applications.filter((a) => !["REJECTED", "WITHDRAWN"].includes(a.status)).length;
  const hired = applications.filter((a) => a.status === "HIRED").length;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${profile?.fullName?.split(" ")[0] ?? "there"} 👋`}
        subtitle="Explore regional job market demand, ATS resume readiness, and AI recommendations."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/labour-market">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Globe size={14} /> Market Demand
              </Button>
            </Link>
            <Link to="/student/opportunities">
              <Button size="sm">Browse Opportunities</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Placement Readiness" value={`${readiness ?? 0}%`} tone="brand" />
        <StatCard label="Verified Skills" value={skillCount} tone="green" />
        <StatCard label="Active Applications" value={activeApplications} tone="amber" />
        <StatCard label="Regional Openings" value={market?.metrics?.totalHiringVolume?.toLocaleString() ?? 0} tone="slate" />
      </div>

      {/* Regional High-Demand Skills & Training Gaps Banner */}
      <Card className="mt-6 p-6 border-l-4 border-l-brand-500 bg-gradient-to-br from-brand-50/20 via-surface-1 to-surface-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Regional Skill Intelligence</Badge>
              <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
                <Zap size={12} /> High-Velocity Skills in Your Region
              </span>
            </div>
            <h3 className="text-base font-bold text-ink mt-1">
              In-Demand Skills Recommended for Your Profile
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Based on active employer hiring signals in Tamil Nadu & South India industrial clusters.
            </p>
          </div>

          <Link to="/student/ai-hub">
            <Button size="sm" variant="primary" className="gap-1.5 shrink-0">
              <Sparkles size={14} /> AI Skill Gap Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {topDemandedSkills.slice(0, 3).map((sk: any) => {
            const hasSkill = userSkillNames.has(sk.skill.toLowerCase());
            return (
              <div
                key={sk.skill}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  hasSkill
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    : "bg-surface-2 border-stroke text-ink"
                }`}
              >
                <div>
                  <p className="font-bold">{sk.skill}</p>
                  <p className="text-[11px] opacity-80">Demand: {sk.demandScore.toFixed(0)}/100</p>
                </div>
                <Badge variant={hasSkill ? "success" : "secondary"}>
                  {hasSkill ? "Acquired" : "Recommended"}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent Applications</h2>
            <Link to="/student/applications" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-stroke">
            {applications.length === 0 && <p className="py-6 text-sm text-ink-faint">You haven't applied to anything yet.</p>}
            {applications.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{a.opportunity.title}</p>
                  <p className="text-xs text-ink-faint">{a.opportunity.company.name} · {a.opportunity.type}</p>
                </div>
                <Badge tone={a.status === "HIRED" ? "green" : a.status === "REJECTED" ? "red" : "brand"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-ink">Career Acceleration Tools</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/labour-market" className="rounded-lg border border-stroke px-4 py-3 text-sm font-medium text-ink hover:bg-surface-2 flex items-center justify-between">
              <span>🌐 Labour Market Demand</span>
              <ArrowRight size={14} className="text-ink-muted" />
            </Link>
            <Link to="/student/ai-hub" className="rounded-lg border border-stroke px-4 py-3 text-sm font-medium text-ink hover:bg-surface-2 flex items-center justify-between">
              <span>✨ AI Resume & Roadmap Hub</span>
              <ArrowRight size={14} className="text-ink-muted" />
            </Link>
            <Link to="/student/mock-interview" className="rounded-lg border border-stroke px-4 py-3 text-sm font-medium text-ink hover:bg-surface-2 flex items-center justify-between">
              <span>🎤 AI Mock Interview Practice</span>
              <ArrowRight size={14} className="text-ink-muted" />
            </Link>
            <Link to="/student/mentor" className="rounded-lg border border-stroke px-4 py-3 text-sm font-medium text-ink hover:bg-surface-2 flex items-center justify-between">
              <span>💬 24/7 AI Career Mentor</span>
              <ArrowRight size={14} className="text-ink-muted" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
