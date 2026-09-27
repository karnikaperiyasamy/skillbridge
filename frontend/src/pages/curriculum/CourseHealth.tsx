import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input, Select, Badge, Spinner, Modal } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Plus,
  BarChart,
  Users,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";

export default function CourseHealth() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    sector: "Information Technology",
    department: "Computer Science",
    state: "Tamil Nadu",
    district: "Chennai",
    durationMonths: 48,
    annualCapacity: 60,
    currentEnrollment: 55,
    placedCount: 48,
    skills: "",
  });

  useEffect(() => {
    fetchHealthData();
  }, []);

  async function fetchHealthData() {
    setLoading(true);
    try {
      const res = await api.get("/curriculum/course-health");
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load course health data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide course name.");
      return;
    }

    setSaving(true);
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post("/curriculum/courses", {
        ...formData,
        skills: skillsArray,
      });

      toast.success("Course added & evaluated successfully!");
      setModalOpen(false);
      fetchHealthData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "HEALTHY":
        return <Badge variant="success">HEALTHY</Badge>;
      case "NEEDS_UPDATE":
        return <Badge variant="warning">NEEDS UPDATE</Badge>;
      case "POTENTIAL_OVERSUPPLY":
        return <Badge variant="danger">OVERSUPPLY RISK</Badge>;
      case "LOW_DEMAND":
        return <Badge variant="secondary">LOW DEMAND</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">SIH26134 Intelligence</Badge>
              <span className="flex items-center gap-1 text-xs text-ink-muted font-medium">
                <Activity size={13} className="text-brand-500" /> Continuous Monitoring
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Course Health & Oversupply Analytics
            </h1>
            <p className="text-sm text-ink-muted">
              Detect program obsolescence, declining placement absorption, and oversupplied academic seats in real-time.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus size={16} /> Register New Program
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 border-l-4 border-l-brand-500">
                <p className="text-xs font-medium text-ink-muted">Total Monitored Programs</p>
                <h3 className="text-2xl font-bold text-ink mt-2">{data?.summary?.totalCourses || 0}</h3>
                <p className="text-xs text-ink-muted mt-1">Across partner institutions</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Healthy Courses</p>
                  <CheckCircle size={18} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-emerald-600">
                  {data?.summary?.healthyCount || 0}
                </h3>
                <p className="text-xs text-ink-muted mt-1">High placement & industry demand</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Syllabus Update Required</p>
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-amber-600">
                  {data?.summary?.needsUpdateCount || 0}
                </h3>
                <p className="text-xs text-ink-muted mt-1">Missing modern skills</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-muted">Oversupply Risk Alert</p>
                  <ShieldAlert size={18} className="text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink mt-2 text-rose-600">
                  {data?.summary?.oversupplyCount || 0}
                </h3>
                <p className="text-xs text-rose-600 font-medium mt-1">Low absorption vs high capacity</p>
              </Card>
            </div>

            {/* Courses List */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-ink mb-4">Program Assessment Breakdown</h3>
              <div className="space-y-4">
                {data?.courses?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-stroke bg-surface-2/60 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-ink text-base">{c.name}</h4>
                          {c.code && <Badge variant="secondary">{c.code}</Badge>}
                        </div>
                        <p className="text-xs text-ink-muted">
                          {c.department} • {c.district}, {c.state} ({c.sector})
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-ink-muted">Alignment Score</span>
                          <p className="text-sm font-bold text-brand-600">{c.alignmentScore}%</p>
                        </div>
                        {getStatusBadge(c.healthStatus)}
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-1 p-3 rounded-lg border border-stroke">
                      <div>
                        <span className="text-ink-muted">Annual Capacity:</span>{" "}
                        <strong className="text-ink">{c.annualCapacity} Seats</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted">Enrollment:</span>{" "}
                        <strong className="text-ink">{c.currentEnrollment}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted">Placed Count:</span>{" "}
                        <strong className="text-ink">{c.placedCount}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted">Placement Rate:</span>{" "}
                        <strong className={c.placementRate >= 70 ? "text-emerald-600" : "text-rose-500"}>
                          {c.placementRate}%
                        </strong>
                      </div>
                    </div>

                    {/* Health Diagnosis Alert */}
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
                        c.healthStatus === "HEALTHY"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : c.healthStatus === "POTENTIAL_OVERSUPPLY"
                          ? "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      <strong>Diagnostic Feedback:</strong> {c.alertMessage}
                    </div>

                    {/* Skills Tagged */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-ink-muted mr-1">Skills Taught:</span>
                      {c.skills?.map((sk: any) => (
                        <span
                          key={sk.id || sk.skillName}
                          className="px-2 py-0.5 rounded-md bg-surface-3 text-ink text-[11px] font-medium"
                        >
                          {sk.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Modal to Register Program */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Register New Academic Course"
        >
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Course Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. B.Tech Computer Science (Data Engineering)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Course Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CS-DE-301"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Annual Capacity</label>
                <Input
                  type="number"
                  value={formData.annualCapacity}
                  onChange={(e) => setFormData({ ...formData, annualCapacity: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Enrollment</label>
                <Input
                  type="number"
                  value={formData.currentEnrollment}
                  onChange={(e) => setFormData({ ...formData, currentEnrollment: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Placed Count</label>
                <Input
                  type="number"
                  value={formData.placedCount}
                  onChange={(e) => setFormData({ ...formData, placedCount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Syllabus Skills (comma separated)
              </label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Python, SQL, Apache Spark, Kafka, AWS"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Evaluating..." : "Save & Analyze Program"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
