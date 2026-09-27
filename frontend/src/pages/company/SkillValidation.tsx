import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input, Select, Badge, Spinner } from "../../components/ui";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";
import {
  CheckCircle2,
  ThumbsUp,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Layers,
} from "lucide-react";

export default function SkillValidation() {
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<any[]>([]);

  const [jobRole, setJobRole] = useState("ML / AI Engineer");
  const [skillName, setSkillName] = useState("");
  const [relevanceStatus, setRelevanceStatus] = useState("HIGH_PRIORITY");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchValidations();
  }, []);

  async function fetchValidations() {
    setLoading(true);
    try {
      const res = await api.get("/employer-validation");
      setValidations(res.data.data);
    } catch (err: any) {
      toast.error("Failed to load skill validations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobRole || !skillName) {
      toast.error("Please provide both job role and skill name.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/employer-validation", {
        jobRole,
        skillName,
        relevanceStatus,
        feedback,
      });

      toast.success("Skill validation submitted to Labour Intelligence Network!");
      setSkillName("");
      setFeedback("");
      fetchValidations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit validation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">SIH26134 Employer Network</Badge>
              <span className="flex items-center gap-1 text-xs text-brand-600 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
                <Building2 size={12} /> Direct Industry Validation
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Employer Skill & Curriculum Validation
            </h1>
            <p className="text-sm text-ink-muted">
              Validate in-demand technical competencies and give direct feedback on academic curriculum standards.
            </p>
          </div>
        </div>

        {/* Validation Form */}
        <Card className="p-6 border-brand-200 dark:border-brand-900 bg-surface-1">
          <h3 className="text-base font-bold text-ink mb-4">Validate or Nominate a Competency</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Target Job Role</label>
                <Input
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. ML / AI Engineer, DevOps Engineer"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Skill Name</label>
                <Input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Generative AI, PyTorch, Docker"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">Relevance Status</label>
                <Select
                  value={relevanceStatus}
                  onChange={(e) => setRelevanceStatus(e.target.value)}
                >
                  <option value="HIGH_PRIORITY">🔥 High Priority (Mandatory for hiring)</option>
                  <option value="RELEVANT">✅ Relevant (Preferred)</option>
                  <option value="NEEDS_UPDATE">🔄 Needs Practical Lab Upgrade</option>
                  <option value="NOT_REQUIRED">❌ Not Required / Obsolete</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase mb-1 block">
                Employer Feedback / Hiring Context (Optional)
              </label>
              <Input
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain why this skill is vital for fresh graduate onboarding..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send size={15} /> {submitting ? "Submitting..." : "Submit Industry Validation"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Recent Validations List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Recent Industry Validations Feed</h3>
            <Badge variant="secondary">Live Feedback</Badge>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-3">
              {validations.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-stroke bg-surface-2/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{v.skillName}</span>
                      <span className="text-xs text-ink-muted">for {v.jobRole}</span>
                      <Badge
                        variant={
                          v.relevanceStatus === "HIGH_PRIORITY"
                            ? "danger"
                            : v.relevanceStatus === "RELEVANT"
                            ? "success"
                            : "warning"
                        }
                      >
                        {v.relevanceStatus.replace("_", " ")}
                      </Badge>
                    </div>

                    {v.feedback && (
                      <p className="text-xs text-ink-muted italic">"{v.feedback}"</p>
                    )}
                  </div>

                  <div className="text-xs text-ink-muted sm:text-right shrink-0">
                    <span className="font-semibold text-ink">{v.company?.name || "Verified Enterprise"}</span>
                  </div>
                </div>
              ))}

              {validations.length === 0 && (
                <p className="text-xs text-ink-muted text-center py-6">
                  No validations submitted yet. Be the first to validate industry skills!
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
