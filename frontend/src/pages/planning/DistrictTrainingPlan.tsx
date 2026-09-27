import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input, Select, Badge, Spinner, Modal } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  FileCheck,
  Plus,
  Target,
  IndianRupee,
  Users,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function DistrictTrainingPlan() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  // Filter
  const [selectedPriority, setSelectedPriority] = useState("");

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    state: "Tamil Nadu",
    district: "Chennai",
    sector: "Information Technology",
    priority: "HIGH",
    targetRole: "",
    recommendedAction: "",
    estimatedBudgetInr: 5000000,
    targetBeneficiaries: 500,
    rationale: "",
    trainerGapAddressed: 10,
    equipmentGapAddressed: 5,
  });

  useEffect(() => {
    fetchPlans();
  }, [selectedPriority]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPriority) params.append("priority", selectedPriority);
      const res = await api.get(`/labour-market/training-plans?${params.toString()}`);
      setPlans(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load district training plans.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.targetRole || !formData.recommendedAction || !formData.rationale) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/labour-market/training-plans", formData);
      toast.success("District training roadmap proposed successfully!");
      setModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create district plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">SIH26134 Planning Console</Badge>
              <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
                <FileCheck size={12} /> District Skill Roadmaps
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              District Skilling Roadmaps & Capacity Interventions
            </h1>
            <p className="text-sm text-ink-muted">
              Strategic, evidence-backed training interventions with faculty upskilling, lab investments, and beneficiary targets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-36"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </Select>

            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus size={16} /> Propose Roadmap
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((p) => (
              <Card key={p.id} className="p-6 border-l-4 border-l-brand-500">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={p.priority === "HIGH" ? "danger" : "warning"}>
                        {p.priority} PRIORITY
                      </Badge>
                      <Badge variant="secondary">{p.status}</Badge>
                      <span className="flex items-center gap-1 text-xs text-ink-muted font-medium">
                        <MapPin size={12} className="text-brand-500" /> {p.district}, {p.state}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-ink">{p.targetRole}</h3>
                    <p className="text-xs text-ink-muted font-semibold uppercase tracking-wider">{p.sector}</p>

                    <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800">
                      <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                        🎯 Recommended Intervention:
                      </p>
                      <p className="text-sm text-brand-800 dark:text-brand-300 mt-0.5">
                        {p.recommendedAction}
                      </p>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed">
                      <strong className="text-ink">Labour Market Evidence & Rationale:</strong> {p.rationale}
                    </p>
                  </div>

                  {/* Key Metrics Pill */}
                  <div className="shrink-0 space-y-2 lg:text-right bg-surface-2 p-4 rounded-xl border border-stroke">
                    <div>
                      <span className="text-xs text-ink-muted">Estimated Budget</span>
                      <p className="text-lg font-bold text-ink">
                        ₹{(p.estimatedBudgetInr / 100000).toFixed(1)} Lakhs
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-ink-muted">Target Beneficiaries</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {p.targetBeneficiaries} Youths
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stroke text-xs text-ink-muted">
                      <span>Faculty: <strong>+{p.trainerGapAddressed}</strong> | Labs: <strong>+{p.equipmentGapAddressed}</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {plans.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-sm text-ink-muted">No district training roadmaps found for current criteria.</p>
              </Card>
            )}
          </div>
        )}

        {/* Modal for New District Plan */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Propose District Training Roadmap"
        >
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Sector</label>
                <Select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Automotive & EV">Automotive & EV</option>
                  <option value="Industrial Automation & Robotics">Industrial Automation & Robotics</option>
                  <option value="Electronics & Hardware">Electronics & Hardware</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Priority Level</label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Target Role</label>
              <Input
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g. EV & Battery Systems Engineer"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Recommended Intervention Action
              </label>
              <textarea
                value={formData.recommendedAction}
                onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-stroke bg-surface-2 p-3 text-sm text-ink focus:border-brand-500 focus:outline-none"
                placeholder="Establish District EV Centre of Excellence and run 40-hour faculty upskilling..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Evidence Rationale
              </label>
              <textarea
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-stroke bg-surface-2 p-3 text-sm text-ink focus:border-brand-500 focus:outline-none"
                placeholder="Regional auto cluster hiring grew 64% YoY with 670 open positions..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Budget (INR)</label>
                <Input
                  type="number"
                  value={formData.estimatedBudgetInr}
                  onChange={(e) => setFormData({ ...formData, estimatedBudgetInr: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Target Beneficiaries</label>
                <Input
                  type="number"
                  value={formData.targetBeneficiaries}
                  onChange={(e) => setFormData({ ...formData, targetBeneficiaries: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Roadmap"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
