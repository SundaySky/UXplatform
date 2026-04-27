import { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, SvgIcon, TextField, Tooltip, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowsRotate, faCircleCheck, faXmark } from "@fortawesome/pro-regular-svg-icons";

interface Task { id: number; label: string | string[]; done: boolean }

const INITIAL_TASKS: Task[] = [
    { id: 1, label: "You’re working on a safety video and need to set up 12 different translations for global audiences.", done: false },
    { id: 2, label: "Your boss mentioned to you that you stopped working with Brazil and you would like to remove it from your videos.", done: false },
    { id: 3, label: "Update this video so it can be used for audiences in Far East countries.", done: false },
    { id: 4, label: ["You learned there’s an option to organize users so you can assign permissions to multiple people at once.", "You want to create Sales and Marketing teams."], done: false },
    { id: 5, label: "You want to create a new template for the Sales team about a new product launch.", done: false },
    { id: 6, label: "You feel your template is ready and you need formal approval, by Sarah from the Legal team, before it can be shared.", done: false },
    { id: 7, label: "Sarah mentioned she submitted feedback for your approval", done: false },
    { id: 8, label: "After completing all changes and receiving approval, the template is ready to go live in Amplify", done: false },
    { id: 9, label: "You are creating a video for a top-secret new product launching later this year. You and Eli Bogan are the only persons authorized to edit this video. The marketing team should be able to view it. no one else can see it.", done: false },
    { id: 10, label: "The privacy team at your company is concerned that employees might misuse the CEO, Chris's avatar to create deepfake content. They've asked you to ensure that other users in the organization cannot access or use this avatar, the legal team should be able to use it.", done: false }
];

type SessionState = "idle" | "active" | "survey" | "complete"

export default function TasksPanel({
    onTaskDone,
    onCurrentTaskChange
}: {
    onTaskDone?: (taskIdx: number) => void
    onCurrentTaskChange?: (taskIdx: number) => void
}) {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [session, setSession] = useState<SessionState>("active");
    const [currentIdx, setCurrentIdx] = useState(0);

    // Notify parent whenever the active task index changes (including via dot
    // navigation, arrows, mark-done, or restart).
    useEffect(() => {
        onCurrentTaskChange?.(currentIdx);
    }, [currentIdx, onCurrentTaskChange]);
    const [surveyStep, setSurveyStep] = useState<1 | 2>(1);
    const [surveyQ1, setSurveyQ1] = useState<number | null>(null);
    const [surveyQ2, setSurveyQ2] = useState<number | null>(null);
    const [surveyWhy1, setSurveyWhy1] = useState("");
    const [surveyWhy2, setSurveyWhy2] = useState("");
    const [pendingNext, setPendingNext] = useState<number | null>(null);

    const doneCount = tasks.filter(t => t.done).length;

    const clearSession = () => {
        setTasks(INITIAL_TASKS.map(t => ({ ...t, done: false })));
        setCurrentIdx(0);
        setSession("active");
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2(""); setPendingNext(null);
    };

    const markDone = () => {
        const updated = tasks.map((task, i) => i === currentIdx ? { ...task, done: true } : task);
        setTasks(updated);
        onTaskDone?.(currentIdx);
        const allDone = updated.every(t => t.done);
        if (allDone) {
            setPendingNext(null);
        }
        else {
            let next = currentIdx + 1;
            while (next < updated.length && updated[next].done) {
                next++;
            }
            setPendingNext(next < updated.length ? next : null);
        }
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2("");
        setSession("survey");
    };

    const advanceSurvey = () => {
        if (surveyStep === 1) {
            setSurveyStep(2);
            setSurveyQ2(null); setSurveyWhy2("");
        }
        else {
            submitSurvey();
        }
    };

    const submitSurvey = () => {
        if (pendingNext !== null) {
            setCurrentIdx(pendingNext);
            setSession("active");
        }
        else {
            setSession("complete");
        }
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2(""); setPendingNext(null);
    };

    const currentTask = tasks[currentIdx];

    return (
        <Box sx={tasksPanelContainerSx}>
            {/* Header */}
            <Box sx={tasksPanelHeaderSx}>
                <Box>
                    <Typography variant="h5" sx={textPrimaryColorSx}>
            Tasks
                    </Typography>
                    <Typography variant="caption" sx={tasksCounterTypographySx}>
                        {doneCount} / {tasks.length} done
                    </Typography>
                </Box>
                <Tooltip title="Restart — resets all tasks">
                    <IconButton size="small" onClick={clearSession} sx={tasksRestartButtonSx}>
                        <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowsRotate} /></SvgIcon>
                    </IconButton>
                </Tooltip>
            </Box>

            {/* All done state */}
            {session === "complete" && (
                <Box sx={tasksDoneStateSx}>
                    <SvgIcon sx={tasksDoneIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>
                    <Typography variant="h5" sx={tasksDoneTitleSx}>
            All tasks complete!
                    </Typography>
                    <Typography variant="caption" sx={tasksDoneSubtitleSx}>
            Great work. Click restart to run through again.
                    </Typography>
                    <Button
                        size="small" variant="outlined" onClick={clearSession}
                        startIcon={<SvgIcon sx={tasksRestartSmallIconSx}><FontAwesomeIcon icon={faArrowsRotate} /></SvgIcon>}
                    >
            Restart
                    </Button>
                </Box>
            )}

            {/* Survey dialog */}
            {(() => {
                const isQ1 = surveyStep === 1;
                const qLabel = isQ1
                    ? "Overall, how easy or difficult was this task?"
                    : "How confident are you that you completed the task correctly?";
                const qValue = isQ1 ? surveyQ1 : surveyQ2;
                const setQ = isQ1 ? setSurveyQ1 : setSurveyQ2;
                const qWhy = isQ1 ? surveyWhy1 : surveyWhy2;
                const setWhy = isQ1 ? setSurveyWhy1 : setSurveyWhy2;
                return (
                    <Dialog
                        open={session === "survey"}
                        maxWidth="xs"
                        fullWidth
                        slotProps={{ paper: { sx: surveyDialogPaperSx } }}
                    >
                        <DialogTitle sx={surveyDialogTitleSx}>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                Question {surveyStep} of 2
                            </Typography>
                            <IconButton size="small" onClick={submitSurvey} sx={surveyCloseButtonSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={surveyDialogContentSx}>
                            <Typography variant="h5" sx={textPrimaryColorSx}>
                                {qLabel}
                            </Typography>

                            {/* 7-point scale */}
                            <Box sx={surveyScaleRowSx}>
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <Box
                                        key={n}
                                        onClick={() => setQ(n)}
                                        sx={{
                                            flex: 1, height: 36, borderRadius: "6px", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `1.5px solid ${qValue === n ? "primary.main" : "grey.400"}`,
                                            bgcolor: qValue === n ? "primary.main" : "background.paper",
                                            transition: "all 0.15s",
                                            "&:hover": { borderColor: "primary.main", bgcolor: qValue === n ? "primary.main" : "primary.light" }
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: qValue === n ? "background.paper" : "text.primary" }}>
                                            {n}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={surveyScaleLabelRowSx}>
                                <Typography variant="caption" sx={textSecondaryColorSx}>Very Difficult</Typography>
                                <Typography variant="caption" sx={textSecondaryColorSx}>Very Easy</Typography>
                            </Box>

                            <TextField
                                label="Why?"
                                placeholder="Tell us more (optional)"
                                multiline
                                rows={2}
                                size="small"
                                value={qWhy}
                                onChange={e => setWhy(e.target.value)}
                            />
                        </DialogContent>

                        <DialogActions sx={surveyDialogActionsSx}>
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={qValue === null}
                                onClick={advanceSurvey}
                            >
                                {surveyStep === 1 ? "Next" : pendingNext !== null ? "Next task" : "Finish"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            })()}

            {/* Active task */}
            {session === "active" && currentTask && (
                <Box sx={tasksActiveSessionSx}>

                    {/* Progress bar */}
                    <Box sx={tasksProgressAreaSx}>
                        <Box sx={tasksProgressLabelRowSx}>
                            <Typography sx={tasksProgressLabelTypographySx}>
                Task {currentIdx + 1} of {tasks.length}
                            </Typography>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                                {doneCount} done
                            </Typography>
                        </Box>
                        <Box sx={tasksProgressTrackSx}>
                            <Box sx={{
                                height: "100%", bgcolor: "primary.main", borderRadius: 2,
                                width: `${(doneCount / tasks.length) * 100}%`,
                                transition: "width 0.3s ease"
                            }} />
                        </Box>
                    </Box>

                    {/* Scrollable content */}
                    <Box sx={tasksScrollableSx}>

                        {/* Task card */}
                        <Box sx={{
                            bgcolor: currentTask.done ? "success.light" : "background.paper",
                            border: 1, borderColor: currentTask.done ? "success.main" : "grey.400",
                            borderRadius: "10px", p: 2, mt: "10px",
                            height: 300,
                            overflow: "hidden",
                            display: "flex", flexDirection: "column", gap: "8px",
                            transition: "background-color 0.2s, border-color 0.2s"
                        }}>
                            {currentTask.done && (
                                <Box sx={taskDoneIndicatorRowSx}>
                                    <SvgIcon sx={taskDoneIndicatorIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>
                                    <Typography variant="caption" sx={taskDoneLabelSx}>
                    Done
                                    </Typography>
                                </Box>
                            )}
                            {(Array.isArray(currentTask.label) ? currentTask.label : [currentTask.label]).map((para, i) => (
                                <Typography key={i} variant="body1" sx={{
                                    mt: i > 0 ? "8px" : 0,
                                    color: currentTask.done ? "text.secondary" : "text.primary",
                                    textDecoration: currentTask.done ? "line-through" : "none"
                                }}>
                                    {para}
                                </Typography>
                            ))}
                        </Box>

                        {/* I'm done */}
                        <Button
                            fullWidth
                            variant="contained"
                            color={currentTask.done ? "success" : "primary"}
                            disabled={currentTask.done}
                            onClick={markDone}
                            sx={{ mt: "10px" }}
                        >
                            {currentTask.done ? "✓  Done" : "I'm done"}
                        </Button>

                        {/* Dot navigation */}
                        <Box sx={tasksDotNavRowSx}>
                            <IconButton className="tasks-nav-arrow" size="small" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)} sx={iconButtonActiveColorSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                            <Box sx={tasksDotsSx}>
                                {tasks.map((task, i) => (
                                    <Box
                                        key={task.id}
                                        onClick={() => setCurrentIdx(i)}
                                        sx={{
                                            width: i === currentIdx ? 16 : 6, height: 6, borderRadius: 3,
                                            bgcolor: task.done ? "success.main" : i === currentIdx ? "primary.main" : "grey.500",
                                            cursor: "pointer", transition: "all 0.2s"
                                        }}
                                    />
                                ))}
                            </Box>
                            <IconButton className="tasks-nav-arrow" size="small" disabled={currentIdx === tasks.length - 1} onClick={() => setCurrentIdx(i => i + 1)} sx={iconButtonActiveColorSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowRight} /></SvgIcon>
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

const textPrimaryColorSx: SxProps<Theme> = { color: "text.primary" };
const textSecondaryColorSx: SxProps<Theme> = { color: "text.secondary" };
const iconButtonActiveColorSx: SxProps<Theme> = { color: "action.active" };

const tasksPanelContainerSx: SxProps<Theme> = {
    width: 250, flexShrink: 0, bgcolor: "grey.100",
    borderLeft: 1, borderLeftColor: "grey.400",
    display: "flex", flexDirection: "column", height: "100%"
};
const tasksPanelHeaderSx: SxProps<Theme> = {
    px: 2, pt: 2, pb: 1.5, borderBottom: 1, borderBottomColor: "grey.400",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexShrink: 0
};
const tasksCounterTypographySx: SxProps<Theme> = { color: "text.secondary", mt: "2px" };
const tasksRestartButtonSx: SxProps<Theme> = { color: "text.secondary" };
const tasksRestartIconSx: SxProps<Theme> = { fontSize: "18px !important", width: "18px !important", height: "18px !important" };
const tasksDoneStateSx: SxProps<Theme> = {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2, px: 2.5
};
const tasksDoneIconSx: SxProps<Theme> = { fontSize: "48px !important", width: "48px !important", height: "48px !important", color: "success.main" };
const tasksDoneTitleSx: SxProps<Theme> = { color: "text.primary", textAlign: "center" };
const tasksDoneSubtitleSx: SxProps<Theme> = { color: "text.secondary", textAlign: "center" };
const tasksRestartSmallIconSx: SxProps<Theme> = { fontSize: "14px !important", width: "14px !important", height: "14px !important" };
const surveyDialogPaperSx: SxProps<Theme> = { p: 1 };
const surveyDialogTitleSx: SxProps<Theme> = {
    pb: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between"
};
const surveyCloseButtonSx: SxProps<Theme> = { color: "action.active", mr: -1 };
const surveyDialogContentSx: SxProps<Theme> = { pt: 1.5, display: "flex", flexDirection: "column", gap: 2 };
const surveyScaleRowSx: SxProps<Theme> = { display: "flex", gap: "4px" };
const surveyScaleLabelRowSx: SxProps<Theme> = { display: "flex", justifyContent: "space-between", mt: "-8px" };
const surveyDialogActionsSx: SxProps<Theme> = { px: 3, pb: 2.5, pt: 0.5 };
const tasksActiveSessionSx: SxProps<Theme> = { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" };
const tasksProgressAreaSx: SxProps<Theme> = { px: 2, pt: 1.5, pb: 1, flexShrink: 0 };
const tasksProgressLabelRowSx: SxProps<Theme> = { display: "flex", justifyContent: "space-between", mb: "6px" };
const tasksProgressLabelTypographySx: SxProps<Theme> = {
    color: "text.secondary", letterSpacing: "0.5px", textTransform: "uppercase"
};
const tasksProgressTrackSx: SxProps<Theme> = { height: 4, bgcolor: "grey.400", borderRadius: 2 };
const tasksScrollableSx: SxProps<Theme> = {
    flex: 1, overflowY: "auto", px: 2, pb: 2, display: "flex", flexDirection: "column"
};
const taskDoneIndicatorRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "6px" };
const taskDoneIndicatorIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "success.main" };
const taskDoneLabelSx: SxProps<Theme> = { color: "success.main", letterSpacing: "0.3px" };
const tasksDotNavRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", pt: "2px", mt: "4px",
    // Arrows fade in on hover of this row (the area beneath the "I'm done" button).
    // Matches the hover-reveal pattern in TemplatePage.tsx (templateDetailsHoverWrapperSx
    // → .template-details-edit-icon).
    "& .tasks-nav-arrow": { opacity: 0, transition: "opacity 150ms" },
    "&:hover .tasks-nav-arrow": { opacity: 1 }
};
const tasksDotsSx: SxProps<Theme> = { display: "flex", gap: "5px" };
