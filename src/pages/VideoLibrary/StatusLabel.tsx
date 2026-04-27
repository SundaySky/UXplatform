import { Tooltip } from "@mui/material";
import { Label } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { STATUS_LABEL_MAP, type StatusKey } from "./types";

export default function StatusLabel({ status }: { status: StatusKey }) {
    const cfg = STATUS_LABEL_MAP[status];
    return (
        <Tooltip title={cfg.tooltip}>
            <span>
                <Label label={status} color={cfg.color} variant={cfg.variant} size="small" />
            </span>
        </Tooltip>
    );
}
