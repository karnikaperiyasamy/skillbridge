import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input, Select, Badge, Spinner } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  TrendingUp,
  Activity,
  Zap,
  AlertTriangle,
  Search,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Sparkles,
} from "lucide-react";

export default function LabourMarketIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Filters
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  // Normalizer Playground
  const [rawSkillInput, setRawSkillInput] = useState("");
  const [normalizedResult, setNormalizedResult] = useState<string | null>(null);
  const [normalizing, setNormalizing] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, [selectedState, selectedDistrict, selectedSector]);

  async function fetchMarketData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== "All States") params.append("state", selectedState);
      if (selectedDistrict && selectedDistrict !== "All Districts") params.append("district", selectedDistrict);
      if (selectedSector && selectedSector !== "All Sectors") params.append("sector", selectedSector);

      const res = await api.get(`/labour-market/overview?${params.toString()}`);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load labour market intelligence.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNormalize() {
    if (!rawSkillInput.trim()) return;
    setNormalizing(true);
    try {
      const res = await api.get(`/labour-market/normalize-skill?skill=${encodeURIComponent(rawSkillInput)}`);
      setNormalizedResult(res.data.normalized);
      toast.success(`Normalized "${rawSkillInput}" → "${res.data.normalized}"`);
    } catch {
      toast.error("Failed to normalize skill.");
    } finally {
      setNormalizing(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="info">SIH26134 Platform</Badge>
              <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
                <Database size={12} /> Live Labour Monitor
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Labour Market Intelligence Engine
            </h1>
            <p className="text-sm text-ink-muted">
              Real-time regional demand scores, growth trajectories, and skill normalizations across Indian industry clusters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
              className="gap-1.5"
            >
              <Activity size={14} /> Refresh Signals
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="p-4 bg-surface-1 border-stroke">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1 block">
                State Filter
              </label>
              <Select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict("");
                }}
              >
                <option value="">All States</option>
                {data?.filters?.availableStates?.map((st: string) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1 block">
                District Filter
              </label>
              <Select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {data?.filters?.availableDistricts
                  ?.filter((d: any) => !selectedState || d.state === selectedState)
                  ?.map((d: any) => (
                    <option key={d.district} value={d.district}>
                      {d.district} ({d.state})
                    </option>
                  ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1 block">
                Industry Sector
              </label>
              <Select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="">All Sectors</option>
                {data?.filters?.availableSectors?.map((sec: string) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 border-l-4 border-l-brand-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Regional Hiring Volume</p>
                  <Activity size={18} className="text-brand-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2">
                  {data?.metrics?.totalHiringVolume?.toLocaleString() || 0}
                </h3>
                <p className="text-xs text-ink-muted mt-1">Verified Open Positions Tracked</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Avg Sector Growth</p>
                  <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2">
                  +{data?.metrics?.avgGrowthRate || 0}%
                </h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">Year-over-Year Expansion</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Active Signals</p>
                  <Layers size={18} className="text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2">
                  {data?.metrics?.activeSignalCount || 0}
                </h3>
                <p className="text-xs text-ink-muted mt-1">District-Level Granular Data</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Data Engine Status</p>
                  <Database size={18} className="text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-ink mt-2">Live & Calibrated</h3>
                <p className="text-xs text-amber-600 font-medium mt-1">Deterministic Scoring</p>
              </Card>
            </div>

            {/* In-Demand Job Roles & Top Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Roles */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-ink">Top In-Demand Job Roles</h3>
                    <p className="text-xs text-ink-muted">Ranked by composite demand score (0-100)</p>
                  </div>
                  <Badge variant="primary">High Priority</Badge>
                </div>

                <div className="space-y-3">
                  {data?.topRoles?.map((item: any, idx: number) => (
                    <div
                      key={item.role}
                      className="p-3.5 rounded-xl border border-stroke bg-surface-2/60 hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">{item.role}</p>
                            <p className="text-xs text-ink-muted">{item.sector}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                            Score {item.demandScore.toFixed(1)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 justify-end font-medium">
                            <ArrowUpRight size={13} /> +{item.growth.toFixed(1)}% YoY
                          </div>
                        </div>
                      </div>

                      {/* Demand bar */}
                      <div className="mt-2.5 h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-gradient rounded-full"
                          style={{ width: `${Math.min(item.demandScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Skills */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-ink">Top In-Demand Skills</h3>
                    <p className="text-xs text-ink-muted">Standardized across employer job requisitions</p>
                  </div>
                  <Badge variant="secondary">Skill Volume</Badge>
                </div>

                <div className="space-y-3">
                  {data?.topSkills?.map((sk: any) => (
                    <div
                      key={sk.skill}
                      className="p-3 rounded-xl border border-stroke bg-surface-2/60 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold text-ink truncate">{sk.skill}</p>
                        <p className="text-xs text-ink-muted">
                          {sk.volume.toLocaleString()} estimated vacancies
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sk.isEmerging && (
                          <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                            Emerging
                          </Badge>
                        )}
                        <span className="text-sm font-bold text-ink">
                          {sk.demandScore.toFixed(1)}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Emerging vs Obsolete Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emerging */}
              <Card className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-emerald-500" size={18} />
                  <h3 className="text-base font-bold text-ink">Emerging High-Velocity Skills</h3>
                </div>
                <p className="text-xs text-ink-muted mb-4">
                  Rapidly expanding technologies recommended for immediate curriculum inclusion.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data?.emergingSkills?.map((sk: any) => (
                    <div
                      key={sk.skill}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                    >
                      <p className="text-sm font-semibold text-ink">{sk.skill}</p>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-ink-muted">Growth</span>
                        <span className="text-emerald-600 font-bold flex items-center">
                          <ArrowUpRight size={13} /> +{sk.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Obsolete / Declining */}
              <Card className="p-6 border-l-4 border-l-rose-500">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-rose-500" size={18} />
                  <h3 className="text-base font-bold text-ink">Declining & Obsolete Skills</h3>
                </div>
                <p className="text-xs text-ink-muted mb-4">
                  Legacy toolchains with negative market growth; recommended to phase out of syllabus.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data?.obsoleteSkills?.length > 0 ? (
                    data.obsoleteSkills.map((sk: any) => (
                      <div
                        key={sk.skill}
                        className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800"
                      >
                        <p className="text-sm font-semibold text-ink">{sk.skill}</p>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-ink-muted">Growth Trend</span>
                          <span className="text-rose-600 font-bold flex items-center">
                            <ArrowDownRight size={13} /> {sk.growth}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-ink-muted col-span-2">No critical obsolete skills detected in current filter.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Interactive Skill Normalization Engine Playground */}
            <Card className="p-6 border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/30 via-surface-1 to-brand-50/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-ink">Skill Normalization Engine (Live Test)</h3>
              </div>
              <p className="text-sm text-ink-muted mb-4">
                Demonstrates how raw aliases (e.g. <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">ReactJS</code>, <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">py</code>, <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">k8s</code>, <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">GenAI</code>) resolve deterministically to canonical taxonomy standard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <Input
                  placeholder="Enter raw skill alias (e.g. react.js, python 3, aws cloud, ml)..."
                  value={rawSkillInput}
                  onChange={(e) => setRawSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNormalize()}
                />
                <Button onClick={handleNormalize} disabled={normalizing} className="shrink-0 gap-2">
                  <Search size={16} /> Normalize
                </Button>
              </div>

              {normalizedResult && (
                <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-stroke flex items-center gap-4 max-w-xl">
                  <div>
                    <span className="text-xs text-ink-muted">Raw Alias Input:</span>
                    <p className="font-mono text-sm font-semibold text-rose-500">{rawSkillInput}</p>
                  </div>
                  <div className="text-lg font-bold text-ink-muted">→</div>
                  <div>
                    <span className="text-xs text-ink-muted">Canonical Standard:</span>
                    <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {normalizedResult}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
