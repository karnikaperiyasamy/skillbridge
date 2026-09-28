import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Select, Badge, Spinner } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  MapPin,
  Users,
  Wrench,
  GraduationCap,
  TrendingUp,
  FileCheck,
  AlertCircle,
  IndianRupee,
  Layers,
} from "lucide-react";

export default function DistrictIntelligence() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Chennai");

  useEffect(() => {
    fetchDistrictData();
  }, [selectedState, selectedDistrict]);

  async function fetchDistrictData() {
    setLoading(true);
    try {
      const res = await api.get(
        `/labour-market/district-intelligence?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`
      );
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load district intelligence.");
    } finally {
      setLoading(false);
    }
  }

  const DISTRICT_OPTIONS: Record<string, string[]> = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Karnataka: ["Bengaluru Urban"],
    Maharashtra: ["Pune"],
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Regional Intelligence Platform</Badge>
              <span className="flex items-center gap-1 text-xs text-ink-muted font-medium">
                <MapPin size={13} className="text-brand-500" /> District-Level Granularity
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              District Training & Infrastructure Planning
            </h1>
            <p className="text-sm text-ink-muted">
              Analyze localized demand vs institutional capacity, faculty deficits, and equipment bottlenecks.
            </p>
          </div>

          {/* District Picker */}
          <div className="flex items-center gap-3">
            <Select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                setSelectedDistrict(DISTRICT_OPTIONS[newState]?.[0] || "");
              }}
              className="w-40"
            >
              {Object.keys(DISTRICT_OPTIONS).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>

            <Select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-44"
            >
              {DISTRICT_OPTIONS[selectedState]?.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 border-l-4 border-l-brand-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Active District Openings</p>
                  <TrendingUp size={18} className="text-brand-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2">
                  {data?.summary?.totalOpenings?.toLocaleString() || 0}
                </h3>
                <p className="text-xs text-ink-muted mt-1">Open employer requisitions</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Certified Faculty Deficit</p>
                  <Users size={18} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-amber-600">
                  {data?.summary?.totalTrainersNeeded || 0} Faculty
                </h3>
                <p className="text-xs text-ink-muted mt-1">Trainers needed for new skills</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Equipment Gap Investment</p>
                  <IndianRupee size={18} className="text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-rose-600">
                  ₹{((data?.summary?.totalEquipmentCostInr || 0) / 100000).toFixed(1)} Lakhs
                </h3>
                <p className="text-xs text-ink-muted mt-1">Lab upgrades required</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">District Placement Rate</p>
                  <GraduationCap size={18} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-emerald-600">
                  {data?.summary?.averagePlacementRate || 0}%
                </h3>
                <p className="text-xs text-ink-muted mt-1">Across monitored institutions</p>
              </Card>
            </div>

            {/* Trainer Deficit Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-brand-600" size={18} />
                  <div>
                    <h3 className="text-base font-bold text-ink">Trainer & Faculty Capacity Gaps</h3>
                    <p className="text-xs text-ink-muted">
                      Certified faculty availability in {selectedDistrict} vs required capacity for emerging industry domains
                    </p>
                  </div>
                </div>
                <Badge variant="warning">Faculty Deficit</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stroke bg-surface-2 text-xs uppercase font-semibold text-ink-muted">
                    <tr>
                      <th className="py-3 px-4">Skill Domain</th>
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-4">Current Available</th>
                      <th className="py-3 px-4">Required</th>
                      <th className="py-3 px-4">Deficit Gap</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke">
                    {data?.trainerGaps?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-ink">{t.skillName}</td>
                        <td className="py-3.5 px-4 text-ink-muted">{t.sector}</td>
                        <td className="py-3.5 px-4">{t.currentTrainers}</td>
                        <td className="py-3.5 px-4">{t.requiredTrainers}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-500">+{t.gapCount} needed</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="danger">{t.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Equipment & Lab Infrastructure Deficit */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="text-indigo-600" size={18} />
                  <div>
                    <h3 className="text-base font-bold text-ink">Equipment & Infrastructure Gap Analysis</h3>
                    <p className="text-xs text-ink-muted">
                      Hardware and simulation benches required for accredited skilling in {selectedDistrict}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Lab Infrastructure</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stroke bg-surface-2 text-xs uppercase font-semibold text-ink-muted">
                    <tr>
                      <th className="py-3 px-4">Equipment / Lab Type</th>
                      <th className="py-3 px-4">Skill / Course Focus</th>
                      <th className="py-3 px-4">Current Units</th>
                      <th className="py-3 px-4">Required Units</th>
                      <th className="py-3 px-4">Gap Units</th>
                      <th className="py-3 px-4">Est. Cost (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke">
                    {data?.equipmentGaps?.map((eq: any) => (
                      <tr key={eq.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-ink">{eq.equipmentType}</td>
                        <td className="py-3.5 px-4 text-ink-muted">{eq.courseOrSkillName}</td>
                        <td className="py-3.5 px-4">{eq.currentUnits}</td>
                        <td className="py-3.5 px-4">{eq.requiredUnits}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-500">+{eq.gapUnits} units</td>
                        <td className="py-3.5 px-4 font-semibold text-ink">
                          ₹{(eq.estimatedCostInr / 100000).toFixed(1)} Lakhs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Prioritized District Action Plans */}
            <Card className="p-6 border-indigo-200 dark:border-indigo-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="text-emerald-600" size={20} />
                  <div>
                    <h3 className="text-base font-bold text-ink">Actionable District Training Roadmaps</h3>
                    <p className="text-xs text-ink-muted">
                      Evidence-backed interventions generated for District Skill Committees (DSC) and Universities
                    </p>
                  </div>
                </div>
                <Badge variant="success">Evidence-Based</Badge>
              </div>

              <div className="space-y-4">
                {data?.trainingPlans?.map((plan: any) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl border border-stroke bg-surface-2/70 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={plan.priority === "HIGH" ? "danger" : "warning"}>
                          {plan.priority} PRIORITY
                        </Badge>
                        <h4 className="font-bold text-ink text-base">{plan.targetRole}</h4>
                        <span className="text-xs text-ink-muted font-medium">({plan.sector})</span>
                      </div>
                      <Badge variant="info">{plan.status}</Badge>
                    </div>

                    <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                      💡 Recommended Action: {plan.recommendedAction}
                    </p>

                    <div className="p-3 rounded-lg bg-surface-1 text-xs text-ink-muted border border-stroke">
                      <strong className="text-ink">Evidence Rationale:</strong> {plan.rationale}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink pt-1">
                      <span>💰 Est. Budget: ₹{(plan.estimatedBudgetInr / 100000).toFixed(1)} Lakhs</span>
                      <span>🎯 Target Beneficiaries: {plan.targetBeneficiaries} Students</span>
                      <span>👨‍🏫 Faculty Trained: {plan.trainerGapAddressed}</span>
                      <span>🔬 Labs Upgraded: {plan.equipmentGapAddressed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
