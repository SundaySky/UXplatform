# Approval Workflow — Acceptance Criteria

> Feature: Video approval workflow (submit → review → feedback → approve)
> Components: `WorkflowApprovalStepper`, `ApprovalDialog`, `CancelApprovalDialog`, `ApproveVideoDialog`, `ConfirmationDialog`

---

## 1. Submit for Approval

### AC-1.1 — Send for approval dialog opens
**Given** the user is on the video page and the video is in Draft status
**When** the user clicks "Submit for approval"
**Then** the ApprovalDialog opens with:
- Title: "Ask an approver to approve this video"
- Info banner: "Approvers will be notified by email and will need to log in to SundaySky"
- One empty approver selector ("Select approver 1")
- Optional comment text field
- "Send for approval" button is disabled

### AC-1.2 — Approver required to send
**Given** the ApprovalDialog is open
**When** no approver is selected
**Then** the "Send for approval" button remains disabled

### AC-1.3 — Send button enables on approver selection
**Given** the ApprovalDialog is open
**When** the user selects at least one approver
**Then** the "Send for approval" button becomes enabled

### AC-1.4 — Multiple approvers can be added
**Given** the ApprovalDialog is open
**When** the user clicks "+ Add an approver"
**Then** a new approver row is added with:
- A second Select dropdown ("Select approver 2")
- An AND/OR logic selector between rows
- A red delete icon on every row

### AC-1.5 — Duplicate approvers are prevented
**Given** the ApprovalDialog has 2+ approver rows
**When** the user has already selected "Sarah Johnson" in one row
**Then** "Sarah Johnson" appears greyed-out and disabled in all other rows

### AC-1.6 — Approver row can be removed
**Given** the ApprovalDialog has 2+ approver rows
**When** the user clicks the red delete icon on a row
**Then** that row is removed; if only 1 row remains, the delete icon disappears

### AC-1.7 — Dialog can be closed without sending
**Given** the ApprovalDialog is open
**When** the user clicks "Cancel" or the X icon
**Then** the dialog closes, no approval is sent, and all form state resets

### AC-1.8 — Backdrop click does not close the dialog
**Given** the ApprovalDialog is open
**When** the user clicks outside the dialog
**Then** the dialog remains open

---

## 2. Confirmation After Sending

### AC-2.1 — Confirmation dialog appears after sending
**Given** the user clicks "Send for approval" with ≥1 approver selected
**Then** the ApprovalDialog closes and the ConfirmationDialog opens showing:
- The approver name(s)
- "You'll be notified by email when approvers respond"
- "Share video using link" action on the left

### AC-2.2 — Multi-approver confirmation message
**Given** the user sent to 2+ approvers
**Then** the ConfirmationDialog includes a note that "Comments will be available once everyone has responded"

### AC-2.3 — Video status changes to Pending
**Given** the ConfirmationDialog is shown
**Then** the video card and video page show "Pending approval" status

---

## 3. Approval In Progress — Partial Response (Phase 1)

### AC-3.1 — Partial response indicator shown
**Given** 1 of N approvers has responded
**Then** the video page shows an orange "1 of N responded" button

### AC-3.2 — Clicking "1 of N responded" opens Studio with empty comments
**Given** the user is in Phase 1
**When** the user clicks "1 of N responded"
**Then** the Studio opens with the comments panel open, showing "There are no unresolved comments"

### AC-3.3 — Approval stepper shows "Sent for review" as active step
**Given** Phase 1 is active
**Then** `WorkflowApprovalStepper` shows:
- "Draft" step: completed (green check)
- "Sent for review" step: active (blue, highlighted ring)
- "Feedback received" step: pending (grey)
- "Approved" step: pending (grey)

### AC-3.4 — Edit button triggers cancel-approval warning
**Given** the user is in Phase 1 (approval pending)
**When** the user clicks the "Edit" button on the video page
**Then** the CancelApprovalDialog opens — NOT a direct navigation to Studio

### AC-3.5 — Clicking a placeholder Edit pill in Studio triggers the warning
**Given** the user is in Studio during Phase 1
**When** the user clicks the "Edit" pill on any text placeholder
**Then** the CancelApprovalDialog opens

### AC-3.6 — "1 of N responded" button does NOT show the cancel dialog
**Given** the user is in Phase 1
**When** the user clicks the "1 of N responded" button
**Then** no cancel dialog is shown — the user goes directly to Studio with comments

---

## 4. Cancel Approval to Edit

### AC-4.1 — Cancel dialog content
**Given** the CancelApprovalDialog is open
**Then** it shows:
- Title: "Editing will cancel approval"
- Body: "To edit this video, you'll need to cancel the current approval. Any changes will make the shared version outdated, and you'll need to request approval again."
- Two actions: "Cancel" (text) and "Cancel approval & edit video" (contained primary)

### AC-4.2 — Dismissing keeps approval active
**Given** the CancelApprovalDialog is open
**When** the user clicks "Cancel" or the X icon
**Then** the dialog closes, the video stays in Pending status, and no navigation occurs

### AC-4.3 — Backdrop and Escape key do NOT dismiss
**Given** the CancelApprovalDialog is open
**When** the user clicks outside the dialog or presses Escape
**Then** the dialog remains open

### AC-4.4 — Confirming cancels approval and opens Studio
**Given** the CancelApprovalDialog is open
**When** the user clicks "Cancel approval & edit video"
**Then**:
- Approval state is cleared (video resets to Draft)
- Sent approvers list is cleared
- User is navigated to Studio
- Comments panel is closed

---

## 5. All Approvers Responded (Phase 2)

### AC-5.1 — "View comments" button appears
**Given** all approvers have responded (Phase 2)
**Then** the video page shows a "View N comments in Studio" primary button

### AC-5.2 — Studio opens with full comment threads
**Given** Phase 2 is active
**When** the user clicks "View N comments in Studio"
**Then** the Studio opens with all comment threads loaded in the comments panel

### AC-5.3 — Editing in Phase 2 does NOT show cancel dialog
**Given** the user is in Phase 2
**When** the user clicks the "Edit" button or a placeholder Edit pill
**Then** no cancel dialog appears — the user can edit freely

### AC-5.4 — Stepper reflects all-responded state
**Given** Phase 2 is active
**Then** `WorkflowApprovalStepper` shows "Feedback received" as the active step

---

## 6. Final Approval (Phase 3 → 4)

### AC-6.1 — "Approve video" button appears
**Given** Phase 3 is active
**Then** the video page shows an "Approve for sharing" button with a tooltip listing the approvers

### AC-6.2 — Approve video dialog content
**Given** the user clicks "Approve for sharing"
**Then** the ApproveVideoDialog opens with:
- Title: "Approve Video?"
- Confirm and Cancel actions

### AC-6.3 — Confirming approval updates status to Approved
**Given** the ApproveVideoDialog is open
**When** the user clicks "Approve"
**Then** the video status changes to "Approved for sharing" (Phase 4)

### AC-6.4 — Stepper shows all steps complete after approval
**Given** Phase 4 is active
**Then** `WorkflowApprovalStepper` shows all 4 steps as completed (green checks)

---

## 7. Approval Progress Stepper (`WorkflowApprovalStepper`)

### AC-7.1 — Correct step highlighted per phase

| Phase | Active step         |
|-------|---------------------|
| 0     | Draft               |
| 1     | Sent for review     |
| 2     | Feedback received   |
| 3     | Approved            |
| 4     | All steps done      |

### AC-7.2 — Completed steps show green check
**Given** any step is in `done` status
**Then** its circle shows a green check icon

### AC-7.3 — Active step has a blue highlight ring
**Given** a step is in `active` status
**Then** its circle is blue with a subtle blue outer ring

### AC-7.4 — Approver names shown in header
**Given** Phase 1–3 is active
**Then** the approver name(s) appear in the top-right of the stepper header

### AC-7.5 — Partial response shown in orange
**Given** Phase 1 is active (1 of N responded)
**Then** the "1 of N approvers responded" label renders in warning orange

---

## 8. Notifications

### AC-8.1 — Phase 1 notification
**Given** 1 approver responds (Phase 1)
**Then** a notification is added: "Sarah Johnson responded to your approval request"

### AC-8.2 — Phase 2 notification
**Given** all approvers respond (Phase 2)
**Then** a notification is added with a link to open Studio with comments

### AC-8.3 — Phase 3 notification
**Given** Phase 3 is reached
**Then** a notification is added: "Your video has been approved"

### AC-8.4 — Notifications are unread until viewed
**Given** a new phase notification is created
**Then** it shows an unread badge until the notifications panel is opened
