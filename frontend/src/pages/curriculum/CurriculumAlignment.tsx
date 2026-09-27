import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input, Select, Badge, Spinner } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";

interface CurriculumTemplate {
  name: string;
  role: string;
  district: string;
  skills: string;
}

const TEMPLATES: CurriculumTemplate[] = [
  {
    name: "B.Tech CS (AI & ML Focus) - Chennai",
    role: "ML / AI Engineer",
    district: "Chennai",
    skills: "React, Python, Machine Learning, Generative AI, Large Language Models (LLMs), PostgreSQL",
  },
  {
    name: "Diploma Legacy Web - Chennai (Misaligned)",
    role: "Full Stack Developer",
    district: "Chennai",
    skills: "HTML, CSS, jQuery, PHP 5.6, XML RPC",
  },
  {
    name: "B.E. Electric Vehicle & Automotive - Chennai",
    role: "EV & Battery Systems Engineer",
    district: "Chennai",
    skills: "Electric Vehicle (EV) Powertrain, Battery Management Systems, Embedded Systems, MATLAB",
  },
  {
    name: "Automation Engineering - Coimbatore",
    role: "IoT & Automation Engineer",
    district: "Coimbatore",
    skills: "PLC Programming, SCADA Systems, Industrial Robotics, C++",
  },
];

export default function CurriculumAlignment() {
  const [targetRole, setTargetRole] = useState("ML / AI Engineer");
  const [district, setDistrict] = useState("Chennai");
  const [rawSkills, setRawSkills] = useState(TEMPLATES[0].skills);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  async function handleAnalyze() {
    if (!targetRole.trim() || !rawSkills.trim()) {
      toast.error("Please provide target role and curriculum skills.");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = rawSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post("/curriculum/analyze", {
        targetJobRole: targetRole,
        district,
        taughtSkills: skillsArray,
      });

      setAnalysis(res.data.data);
      toast.success("Curriculum alignment analysis complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to analyze curriculum alignment.");
    } finally {
      setLoading(false);
    }
  }

  function applyTemplate(tpl: CurriculumTemplate) {
    setTargetRole(tpl.role);
    setDistrict(tpl.district);
    setRawSkills(tpl.skills);
    setAnalysis(null);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">SIH26134 Core Engine</Badge>
              <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
                <BookOpen size={12} /> Institutional Alignment
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Curriculum & Syllabus Alignment Engine
            </h1>
            <p className="text-sm text-ink-muted">
              Benchmark university course syllabi against real-time labour market demand signals and regional industry expectations.
            </p>
          </div>
        </div>

        {/* Quick Benchmark Templates */}
        <Card className="p-4 bg-surface-1 border-stroke">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Preset Benchmark Syllabus Scenarios:
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stroke bg-surface-2 hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </Card>

        {/* Input Form */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-ink mb-4">Curriculum Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Target Industry Role
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. ML / AI Engineer, Full Stack Developer, EV Engineer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Target District Cluster
              </label>
              <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="Chennai">Chennai (Tamil Nadu)</option>
                <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                <option value="Bengaluru Urban">Bengaluru Urban (Karnataka)</option>
                <option value="Pune">Pune (Maharashtra)</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Current Taught Skills & Lab Modules (comma-separated)
              </label>
              <textarea
                value={rawSkills}
                onChange={(e) => setRawSkills(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-stroke bg-surface-2 p-3 text-sm text-ink focus:border-brand-500 focus:outline-none"
                placeholder="e.g. React, Python, Machine Learning, HTML, CSS"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
              {loading ? <Spinner size="sm" /> : <Sparkles size={16} />} Run Alignment Engine
            </Button>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Banner */}
            <Card className="p-6 bg-gradient-to-br from-surface-1 via-surface-2 to-surface-1 border-stroke">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <Badge
                    variant={
                      analysis.alignmentScore >= 80
                        ? "success"
                        : analysis.alignmentScore >= 50
                        ? "warning"
                        : "danger"
                    }
                    className="text-sm px-3 py-1 mb-2"
                  >
                    {analysis.status.replace("_", " ")}
                  </Badge>
                  <h2 className="text-2xl font-bold text-ink">
                    Curriculum Alignment Score: {analysis.alignmentScore}%
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    Evaluated against {analysis.totalIndustrySkillsEvaluated} real-world industry requirements in {district}.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {analysis.coveredSkillsCount}
                    </p>
                    <p className="text-xs text-ink-muted font-medium">Covered Skills</p>
                  </div>
                  <div className="h-10 w-px bg-stroke" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-500">
                      {analysis.missingSkillsCount}
                    </p>
                    <p className="text-xs text-ink-muted font-medium">Missing Gaps</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 h-2.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    analysis.alignmentScore >= 80
                      ? "bg-emerald-500"
                      : analysis.alignmentScore >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(analysis.alignmentScore, 100)}%` }}
                />
              </div>
            </Card>

            {/* Covered vs Missing Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Covered Skills */}
              <Card className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <h3 className="text-base font-bold text-ink">Covered Industry Skills</h3>
                </div>
                <div className="space-y-2.5">
                  {analysis.coveredSkills?.map((item: any) => (
                    <div
                      key={item.skill}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
                    >
                      <span className="font-semibold text-sm text-ink">{item.skill}</span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                        Market Demand: {item.demandScore}/100
                      </span>
                    </div>
                  ))}
                  {analysis.coveredSkills?.length === 0 && (
                    <p className="text-xs text-ink-muted">No target industry skills found in current syllabus.</p>
                  )}
                </div>
              </Card>

              {/* Missing Skills */}
              <Card className="p-6 border-l-4 border-l-rose-500">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="text-rose-500" size={18} />
                  <h3 className="text-base font-bold text-ink">Missing Critical Gaps</h3>
                </div>
                <div className="space-y-2.5">
                  {analysis.missingSkills?.map((item: any) => (
                    <div
                      key={item.skill}
                      className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-sm text-ink">{item.skill}</p>
                        <p className="text-[11px] text-ink-muted">Growth: +{item.growthRate}% YoY</p>
                      </div>
                      <Badge variant="danger" className="text-[10px]">
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                  {analysis.missingSkills?.length === 0 && (
                    <p className="text-xs text-emerald-600 font-medium">All critical industry requirements are met!</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Emerging & Obsolete Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emerging */}
              <Card className="p-5 border-l-4 border-l-brand-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-brand-500" size={16} />
                  <h4 className="font-bold text-sm text-ink">Emerging Technologies to Introduce</h4>
                </div>
                <div className="space-y-2 mt-3">
                  {analysis.emergingSkills?.map((item: any) => (
                    <div key={item.skill} className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                      • {item.skill} (+{item.growthRate}% growth)
                    </div>
                  ))}
                  {(!analysis.emergingSkills || analysis.emergingSkills.length === 0) && (
                    <p className="text-xs text-ink-muted">No additional emerging skills pending integration.</p>
                  )}
                </div>
              </Card>

              {/* Obsolete */}
              <Card className="p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-amber-500" size={16} />
                  <h4 className="font-bold text-sm text-ink">Legacy Subjects to Phase Out</h4>
                </div>
                <div className="space-y-2 mt-3">
                  {analysis.obsoleteOrLowDemand?.map((sk: string) => (
                    <div key={sk} className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      ⚠️ {sk} (Negative industry demand)
                    </div>
                  ))}
                  {(!analysis.obsoleteOrLowDemand || analysis.obsoleteOrLowDemand.length === 0) && (
                    <p className="text-xs text-ink-muted">No obsolete legacy topics detected in syllabus.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Step-by-Step Actionable Modernization Roadmap */}
            <Card className="p-6 border-indigo-200 dark:border-indigo-900 bg-surface-2">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-amber-500" size={20} />
                <h3 className="text-base font-bold text-ink">Curriculum Modernization Roadmap</h3>
              </div>

              <div className="space-y-3">
                {analysis.actionableRecommendations?.map((rec: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-1 border border-stroke flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-white text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-ink">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
