import type { Theme, SxProps } from "@mui/material";
import { Box, Typography, Tooltip, SvgIcon } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faHourglass, faPen, faPaperPlane, faCircleCheck } from "@fortawesome/pro-regular-svg-icons";

const APPROVER_LABELS: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
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

    return (
        <Box sx={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1, minWidth: 0 }}>

            {/* Node column */}
            <Box sx={nodeColumnSx}>

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
                    <Box sx={circleInnerSx}>
                        {isDone ? <SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCheck} /></SvgIcon> : step.icon}
                    </Box>
                </Box>

                {/* Label */}
                <Typography variant="caption" sx={{
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
        { id: 0, label: "Draft", icon: <SvgIcon sx={{ fontSize: 15 }}><FontAwesomeIcon icon={faPen} /></SvgIcon>, status: statusOf(0) },
        { id: 1, label: "Sent for review", icon: <SvgIcon sx={{ fontSize: 15 }}><FontAwesomeIcon icon={faPaperPlane} /></SvgIcon>, status: statusOf(1) },
        { id: 2, label: "Feedback received", icon: <SvgIcon sx={{ fontSize: 15 }}><FontAwesomeIcon icon={faHourglass} /></SvgIcon>, status: statusOf(2) },
        { id: 3, label: "Approved", icon: <SvgIcon sx={{ fontSize: 15 }}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>, status: statusOf(3) }
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
            <Box sx={headerRowSx}>
                <Typography variant="h5" sx={headerTitleSx}>
          Approval progress
                </Typography>

                {subtitleParts.length > 0 && (
                    <Tooltip
                        title={`Approvers: ${approverNames}`}
                        placement="top"
                        arrow
                        slotProps={{ tooltip: { sx: navyTooltipSx } }}
                    >
                        {phase === 1 ? (
                            <Typography variant="h5" sx={subtitleWarnSx}>
                                {subtitleParts.join(" · ")}
                            </Typography>
                        ) : (
                            <Typography variant="caption" sx={subtitleDoneSx}>
                                {subtitleParts.join(" · ")}
                            </Typography>
                        )}
                    </Tooltip>
                )}
            </Box>

            {/* Steps row */}
            <Box sx={stepsRowSx}>
                {steps.map((step, i) => (
                    <StepNode key={step.id} step={step} isLast={i === steps.length - 1} />
                ))}
            </Box>

        </Box>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const navyTooltipSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: "6px",
    maxWidth: 220,
    whiteSpace: "pre-line",
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};
const nodeColumnSx: SxProps<Theme> = { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" };
const circleInnerSx: SxProps<Theme> = { color: "common.white", display: "flex", alignItems: "center" };
const headerRowSx: SxProps<Theme> = { display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: "16px" };
const headerTitleSx: SxProps<Theme> = { color: "secondary.main", letterSpacing: "0.3px" };
const subtitleWarnSx: SxProps<Theme> = { color: "warning.main", cursor: "default" };
const subtitleDoneSx: SxProps<Theme> = { color: "text.secondary", cursor: "default" };
const stepsRowSx: SxProps<Theme> = { display: "flex", alignItems: "flex-start" };
