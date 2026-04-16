import type { Theme } from "@mui/material";
import { Box, Typography, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

const APPROVER_LABELS: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};

const navyTooltipSx = {
    bgcolor: "secondary.main",
    borderRadius: "6px",
    fontSize: 11,
    maxWidth: 220,
    whiteSpace: "pre-line" as const,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

// ─── Step definition ──────────────────────────────────────────────────────────
type StepStatus = "done" | "active" | "pending"

interface StepDef {
  id: number
  label: string
  icon: React.ReactNode
  status: StepStatus
}

// ─── Single step node ─────────────────────────────────────────────────────────
function StepNode({ step, isLast }: { step: StepDef; isLast: boolean }) {
    const isDone = step.status === "done";
    const isActive = step.status === "active";

    const circleColor = isDone ? "success.main"
        : isActive ? "primary.main"
            : "action.disabled";

    const labelColor = isDone || isActive ? "text.primary" : "text.secondary";
    const labelWeight = isActive ? 600 : 400;

    return (
        <Box sx={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1, minWidth: 0 }}>

            {/* Node column */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>

                {/* Circle */}
                <Box sx={(theme: Theme) => ({
                    width: 32, height: 32,
                    borderRadius: "50%",
                    bgcolor: circleColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 0 4px ${theme.palette.action.hover}` : "none",
                    transition: "all 0.2s"
                })}>
                    <Box sx={{ color: "#fff", display: "flex", alignItems: "center" }}>
                        {isDone ? <CheckIcon sx={{ fontSize: 16 }} /> : step.icon}
                    </Box>
                </Box>

                {/* Label */}
                <Typography variant="caption" sx={{
                    fontSize: 11,
                    fontWeight: labelWeight,
                    color: labelColor,
                    textAlign: "center",
                    whiteSpace: "nowrap"
                }}>
                    {step.label}
                </Typography>

            </Box>

            {/* Connector line */}
            {!isLast && (
                <Box sx={{
                    flex: 1, height: 2,
                    bgcolor: isDone ? "success.main" : "divider",
                    mx: "8px",
                    mb: "22px",
                    borderRadius: 1,
                    transition: "background-color 0.2s"
                }} />
            )}

        </Box>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  /** 0 = draft · 1 = partial response · 2 = all responded · 3 = ready to approve · 4 = approved */
  phase: number
  approvers: string[]
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorkflowApprovalStepper({ phase, approvers }: Props) {
    const approverNames = approvers
        .map(a => APPROVER_LABELS[a] ?? a)
        .join(", ");

    const respondedInfo = phase === 1
        ? `1 of ${approvers.length} approver${approvers.length > 1 ? "s" : ""} responded`
        : phase >= 2
            ? `${approvers.length} of ${approvers.length} approver${approvers.length > 1 ? "s" : ""} responded`
            : "";

    function statusOf(stepIdx: number): StepStatus {
        if (phase === 0) {
            return stepIdx === 0 ? "active" : "pending";
        }
        if (phase === 1) {
            if (stepIdx === 0) {
                return "done";
            }
            if (stepIdx === 1) {
                return "active";
            }
            return "pending";
        }
        if (phase === 2) {
            if (stepIdx <= 1) {
                return "done";
            }
            if (stepIdx === 2) {
                return "active";
            }
            return "pending";
        }
        if (phase === 3) {
            if (stepIdx <= 2) {
                return "done";
            }
            if (stepIdx === 3) {
                return "active";
            }
            return "pending";
        }
        return "done";
    }

    const steps: StepDef[] = [
        { id: 0, label: "Draft", icon: <EditOutlinedIcon sx={{ fontSize: 15 }} />, status: statusOf(0) },
        { id: 1, label: "Sent for review", icon: <SendOutlinedIcon sx={{ fontSize: 15 }} />, status: statusOf(1) },
        { id: 2, label: "Feedback received", icon: <HourglassTopIcon sx={{ fontSize: 15 }} />, status: statusOf(2) },
        { id: 3, label: "Approved", icon: <TaskAltIcon sx={{ fontSize: 15 }} />, status: statusOf(3) }
    ];

    const subtitleParts: string[] = [];
    if (approverNames && phase >= 1 && phase <= 3) {
        subtitleParts.push(approverNames);
    }
    if (respondedInfo) {
        subtitleParts.push(respondedInfo);
    }

    return (
        <Box sx={(theme: Theme) => ({
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "12px",
            px: "24px",
            pt: "16px",
            pb: "20px"
        })}>

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: "16px" }}>
                <Typography variant="caption" sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "secondary.main",
                    letterSpacing: "0.3px"
                }}>
          Approval progress
                </Typography>

                {subtitleParts.length > 0 && (
                    <Tooltip
                        title={`Approvers: ${approverNames}`}
                        placement="top"
                        arrow
                        componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                    >
                        <Typography variant="caption" sx={{
                            fontSize: 11,
                            color: phase === 1 ? "warning.main" : "text.secondary",
                            fontWeight: phase === 1 ? 600 : 400,
                            cursor: "default"
                        }}>
                            {subtitleParts.join(" · ")}
                        </Typography>
                    </Tooltip>
                )}
            </Box>

            {/* Steps row */}
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                {steps.map((step, i) => (
                    <StepNode key={step.id} step={step} isLast={i === steps.length - 1} />
                ))}
            </Box>

        </Box>
    );
}
