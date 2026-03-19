import {
  Box, Typography, Button, Avatar, IconButton,
  InputAdornment, OutlinedInput,
} from '@mui/material'
import MoreVertIcon                   from '@mui/icons-material/MoreVert'
import SearchIcon                     from '@mui/icons-material/Search'
import NotificationsNoneIcon          from '@mui/icons-material/NotificationsNone'
import VideoLibraryOutlinedIcon       from '@mui/icons-material/VideoLibraryOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import PermMediaOutlinedIcon          from '@mui/icons-material/PermMediaOutlined'
import AutoAwesomeOutlinedIcon        from '@mui/icons-material/AutoAwesomeOutlined'
import BarChartOutlinedIcon           from '@mui/icons-material/BarChartOutlined'
import FolderOutlinedIcon             from '@mui/icons-material/FolderOutlined'
import AddIcon                        from '@mui/icons-material/Add'
import PeopleAltOutlinedIcon          from '@mui/icons-material/PeopleAltOutlined'
import SyncIcon                       from '@mui/icons-material/Sync'

// ─── Figma asset image — split template (HEADING PLACEHOLDER left + media right)
const IMG_THUMB = 'http://localhost:3845/assets/97e7204ec6cc59bf101e4028160eb82f669e8077.png'

// ─── DS tokens ────────────────────────────────────────────────────────────────
const t = {
  primaryMain:    '#0053E5',
  primarySelected:'#0053E51A',
  divider:        '#0053E51F',
  textPrimary:    '#323338',
  textSecondary:  '#3C3C48CC',
  actionActive:   '#0000008F',
  grey200:        '#EEEEEE',
  bgDefault:      '#F4F7FF',
  bgPaper:        '#FFFFFF',
  secondaryMain:  '#03194F',
  successMain:    '#118747',
  successLight:   '#E5F7E0',
  errorMain:      '#E62843',
  errorLight:     '#FFEBEE',
  warningMain:    '#F46900',
  warningLight:   '#FFF5CE',
  // "Approved for sharing" / "Downloaded" use primary blue
  approvedBg:     '#EAF1FF',
  approvedColor:  '#0053E5',
  // "Downloaded for Sharing" uses success green
  downloadedBg:   '#E5F7E0',
  downloadedColor:'#118747',
}

// ─── Status chip config ───────────────────────────────────────────────────────
export type StatusKey =
  | 'Draft'
  | 'Approved for sharing'
  | 'Downloaded for Sharing'
  | 'Downloaded'
  | 'Live'
  | 'Shared'
  | 'Pending approval'

interface StatusConfig { bg: string; color: string; Icon?: React.ElementType }
const STATUS: Record<StatusKey, StatusConfig> = {
  'Draft':                  { bg: t.grey200,        color: t.textSecondary },
  'Approved for sharing':   { bg: t.approvedBg,     color: t.approvedColor,  Icon: SyncIcon },
  'Downloaded for Sharing': { bg: t.downloadedBg,   color: t.downloadedColor, Icon: SyncIcon },
  'Downloaded':             { bg: t.approvedBg,     color: t.approvedColor,  Icon: SyncIcon },
  'Live':                   { bg: t.errorLight,     color: t.errorMain      },
  'Shared':                 { bg: t.approvedBg,     color: t.approvedColor  },
  'Pending approval':       { bg: t.grey200,        color: t.textSecondary },
}

function StatusLabel({ status }: { status: StatusKey }) {
  const cfg = STATUS[status]
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      bgcolor: cfg.bg, borderRadius: '4px', px: '6px', pt: '2px', pb: '3px', flexShrink: 0,
    }}>
      {cfg.Icon && <cfg.Icon sx={{ fontSize: 12, color: cfg.color }} />}
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
        lineHeight: 1.5, color: cfg.color, whiteSpace: 'nowrap',
      }}>
        {status}
      </Typography>
    </Box>
  )
}

function PersonalizedChip() {
  // Figma: border border-[var(--grey/400,#bdbdbd)] — outlined, no fill
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      border: '1px solid #BDBDBD', borderRadius: '4px',
      px: '6px', pt: '2px', pb: '3px', flexShrink: 0,
    }}>
      <PeopleAltOutlinedIcon sx={{ fontSize: 12, color: t.actionActive }} />
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
        lineHeight: 1.5, color: t.textSecondary, whiteSpace: 'nowrap',
      }}>
        Personalized
      </Typography>
    </Box>
  )
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
type ThumbType = 'full' | 'photo' | 'split-template'

function VideoThumbnail({ _type }: { _type?: ThumbType }) {
  return (
    <Box
      component="img"
      src={IMG_THUMB}
      alt=""
      sx={{ width: '100%', height: 171, objectFit: 'cover', display: 'block' }}
    />
  )
}

// ─── Video card ───────────────────────────────────────────────────────────────
// Figma: "Thumbnail video gallery" — bg-white p-[8px] rounded-[8px]
export interface VideoItem {
  title:        string
  subtitle?:    string
  editedBy:     string
  statuses:     StatusKey[]
  personalized: boolean
  thumb:        ThumbType
}

function VideoCard({ video, onClick }: { video: VideoItem; onClick?: () => void }) {
  return (
    // Figma: bg-white flex flex-col items-start p-[8px] rounded-[8px]
    <Box
      onClick={onClick}
      sx={{
        bgcolor: '#FFFFFF', borderRadius: '8px', p: '8px',
        display: 'flex', flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
        '&:hover': onClick ? { boxShadow: '0px 2px 10px rgba(3,25,79,0.14)' } : {},
        width: '100%', boxSizing: 'border-box',
      }}
    >
      {/* Figma: Thumbnail — bg-[#fafafa] border-divider rounded-[8px] overflow-hidden */}
      <Box sx={{
        borderRadius: '8px', overflow: 'hidden',
        border: `1px solid ${t.divider}`, bgcolor: '#FAFAFA',
        width: '100%',
      }}>
        <VideoThumbnail />
      </Box>

      {/* Figma: video Card Content — pt-[8px] gap-[4px] */}
      <Box sx={{ pt: '8px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {/* Title + overflow menu */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14,
            lineHeight: 1.5, color: t.textPrimary, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {video.title}
          </Typography>
          <IconButton size="small" sx={{ color: t.actionActive, mt: '-2px', ml: '4px', flexShrink: 0 }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Edited by — Figma: caption 12px tracking-0.4px */}
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
          lineHeight: 1.66, color: t.textSecondary, letterSpacing: '0.4px',
        }}>
          {video.editedBy}
        </Typography>

        {/* Status chips — Figma: "Left indiations" row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          {video.statuses.map(s => <StatusLabel key={s} status={s} />)}
          {video.personalized && <PersonalizedChip />}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Folder card ──────────────────────────────────────────────────────────────
function FolderCard({ name, count }: { name: string; count: number }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 1.5, borderRadius: 2,
      bgcolor: t.bgPaper, border: `1px solid ${t.divider}`,
      cursor: 'pointer', '&:hover': { bgcolor: t.primarySelected },
    }}>
      <FolderOutlinedIcon sx={{ fontSize: 24, color: t.primaryMain }} />
      <Box>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14,
          lineHeight: 1.5, color: t.textPrimary,
        }}>
          {name}
        </Typography>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
          lineHeight: 1.5, color: t.textSecondary, letterSpacing: '0.4px',
        }}>
          {count} {count === 1 ? 'item' : 'items'}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
// Figma specs: width=112px, nav item px=4px py=16px gap=4px,
// font=Open Sans SemiBold 13px white tracking=0.46px capitalize,
// selected bg=#02143e, Create button = gradient pill h=30px w=94px rounded=16px
const NAV_ITEMS = [
  { icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 20 }} />,       label: 'Video Library',       selected: true  },
  { icon: <DashboardCustomizeOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Template Library',    selected: false },
  { icon: <PermMediaOutlinedIcon sx={{ fontSize: 20 }} />,          label: 'Media',               selected: false },
  { icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20 }} />,        label: 'Inspiration Gallery', selected: false },
  { icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />,           label: 'Analytics',           selected: false },
]

const GRADIENT_CREATE =
  'linear-gradient(154.241deg, rgb(235,137,241) 16.092%, rgb(212,127,239) 25.944%, ' +
  'rgb(193,117,238) 35.796%, rgb(171,109,236) 45.649%, rgb(147,101,235) 55.501%, ' +
  'rgb(119,94,233) 65.353%, rgb(83,88,231) 75.205%, rgb(0,83,229) 85.057%)'

function AppSidebar() {
  return (
    <Box sx={{
      width: 112, flexShrink: 0, bgcolor: t.secondaryMain,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Logo area — Figma: LogoforMenu h=104px */}
      <Box sx={{
        height: 104, width: 112, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {[{ chars: 'SUN', color: '#fff' }, { chars: 'DAY', color: '#fff' }, { chars: 'SKY', color: t.primaryMain }]
          .map(({ chars, color }) => (
            <Typography key={chars} sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.22em', lineHeight: 1.4, color, display: 'block',
            }}>
              {chars}
            </Typography>
          ))}
      </Box>

      {/* Create button — Figma: gradient pill h=30px w=94px rounded=16px */}
      <Button
        startIcon={<AddIcon sx={{ fontSize: '13px !important' }} />}
        sx={{
          background: GRADIENT_CREATE,
          color: '#fff',
          fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13,
          textTransform: 'none',
          height: 30, width: 94, minWidth: 'unset',
          borderRadius: '16px',
          px: '10px',
          mb: '8px',
          flexShrink: 0,
          '&:hover': { opacity: 0.88, background: GRADIENT_CREATE },
        }}
      >
        Create
      </Button>

      {/* Nav items — Figma: width=112px px=4px py=16px gap=4px */}
      {NAV_ITEMS.map(({ icon, label, selected }) => (
        <Box key={label} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '4px', px: '4px', py: '16px', width: 112,
          cursor: 'pointer',
          bgcolor: selected ? '#02143e' : 'transparent',
          '&:hover': { bgcolor: selected ? '#02143e' : 'rgba(255,255,255,0.06)' },
        }}>
          <Box sx={{ color: '#fff' }}>{icon}</Box>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
            fontSize: 13, lineHeight: 1.3, letterSpacing: '0.46px',
            color: '#fff', textAlign: 'center', textTransform: 'capitalize',
          }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ─── Data — matches real app screenshots ─────────────────────────────────────
// Recent: 5 cards with real names, varied lengths, statuses, and thumbnail types
const RECENT_VIDEOS: VideoItem[] = [
  {
    title:        'Stay Safe During Missile Threats',
    subtitle:     'Essential Safety Protocols',
    editedBy:     'Edited in the past 7 days by you',
    statuses:     ['Draft'],
    personalized: false,
    thumb:        'photo',
  },
  {
    title:        'Recent TTS Pronunciation Advancements',   // ← links to video page
    subtitle:     'Explore New Tools for Enhanced Communication',
    editedBy:     'Edited in the past 7 days by you',
    statuses:     ['Pending approval'],
    personalized: true,
    thumb:        'full',
  },
  {
    title:        'Prepare for Winter Fun!',
    subtitle:     'Family Bonding through Home Prep',
    editedBy:     'Edited in the past 7 days by you',
    statuses:     ['Draft'],
    personalized: false,
    thumb:        'split-template',
  },
  {
    title:        'Understanding the American-Israel-Iran Conflict: Peace & Safety',
    subtitle:     undefined,
    editedBy:     'Edited in the past month by you',
    statuses:     ['Draft'],
    personalized: false,
    thumb:        'split-template',
  },
  {
    title:        "Discover Tel Aviv's Scenic Parks",
    subtitle:     'Urban Oasis Awaits',
    editedBy:     'Edited in the past month by you',
    statuses:     ['Approved for sharing'],
    personalized: true,
    thumb:        'photo',
  },
]

// Videos section: varied titles, statuses, and formats
const ALL_VIDEOS: VideoItem[] = [
  {
    title:        'Prepare for Winter Fun!',
    subtitle:     'Family Bonding through Home Prep',
    editedBy:     'Edited in the past month',
    statuses:     ['Approved for sharing'],
    personalized: true,
    thumb:        'full',
  },
  {
    title:        'Stay Safe During Missile Threats',
    subtitle:     'Essential Safety Protocols',
    editedBy:     'Edited on Nov 4, 2025',
    statuses:     ['Downloaded for Sharing'],
    personalized: false,
    thumb:        'photo',
  },
  {
    title:        'Doc-to-vid test',
    subtitle:     undefined,
    editedBy:     'Edited on Jan 12',
    statuses:     ['Downloaded'],
    personalized: true,
    thumb:        'split-template',
  },
  {
    title:        'Testing recording what will happen when the video name is really really long',
    subtitle:     undefined,
    editedBy:     'Edited on Jul 9, 2025',
    statuses:     ['Downloaded'],
    personalized: false,
    thumb:        'split-template',
  },
  {
    title:        'Recording',
    subtitle:     undefined,
    editedBy:     'Edited on Nov 11, 2025',
    statuses:     ['Downloaded'],
    personalized: false,
    thumb:        'photo',
  },
  {
    title:        'Template editor',
    subtitle:     undefined,
    editedBy:     'Edited on Jul 10, 2025',
    statuses:     ['Approved for sharing'],
    personalized: true,
    thumb:        'split-template',
  },
  {
    title:        'Editor template test',
    subtitle:     undefined,
    editedBy:     'Edited on Apr 29, 2025',
    statuses:     ['Approved for sharing'],
    personalized: false,
    thumb:        'split-template',
  },
  {
    title:        'Onboarding Steps',
    subtitle:     undefined,
    editedBy:     'Edited on Oct 16, 2025',
    statuses:     ['Downloaded'],
    personalized: false,
    thumb:        'split-template',
  },
]

const FOLDERS = [
  { name: 'Announcements',            count: 3 },
  { name: 'Old campaigns',            count: 0 },
  { name: 'Sales',                    count: 1 },
  { name: 'Onboarding videos Se...', count: 0 },
  { name: 'Copilot drafts',           count: 3 },
  { name: 'Archive',                  count: 0 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
interface Props { onSelectVideo: (video: VideoItem) => void }

export default function VideoLibraryPage({ onSelectVideo }: Props) {
  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      <AppSidebar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 4, py: 1.5, bgcolor: '#FFFFFF', borderBottom: `1px solid ${t.divider}`,
        }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['Link', 'Link', 'Link', 'Link'].map((l, i, arr) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
                  lineHeight: 1.5, color: t.textSecondary, cursor: 'pointer',
                  '&:hover': { color: t.primaryMain },
                }}>
                  {l}
                </Typography>
                {i < arr.length - 1 && (
                  <Typography sx={{ color: t.textSecondary, fontSize: 12 }}>/</Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Right: search + bell + user */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <OutlinedInput
              placeholder="Search..."
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: t.textSecondary }} />
                </InputAdornment>
              }
              sx={{ width: 200, bgcolor: t.bgPaper, fontSize: 14, fontFamily: '"Open Sans", sans-serif' }}
            />
            <IconButton size="small" sx={{ color: t.actionActive }}>
              <NotificationsNoneIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 14, color: t.textPrimary,
              }}>
                maya-carmel-playgr...
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#03194F', fontSize: 11 }}>
                MC
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 4, py: 3 }}>

          <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 28,
            lineHeight: 1.5, color: t.textPrimary, mb: 3,
          }}>
            Video Library
          </Typography>

          {/* ── Recent ─────────────────────────────────────────────────────── */}
          {/* Figma: flex flex-col gap-[16px] pl-[8px] */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', pl: '8px', mb: 4 }}>
            {/* Title — Figma: Inter Medium 24px h-[32px] */}
            <Typography sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 24,
              lineHeight: '32px', color: t.textPrimary,
            }}>
              Recent
            </Typography>
            {/* Horizontal scroll strip — Figma: bg-[#f4f7ff] pl-[8px] py-[8px] gap-[8px]
                rounded-bl-[8px] rounded-tl-[8px] overflow-clip (→ overflow-x:auto) */}
            <Box sx={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              overflowX: 'auto', pl: '8px', py: '8px',
              bgcolor: t.bgDefault,
              borderRadius: '8px 0 0 8px',
              // thin scrollbar
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#C9D4EB', borderRadius: 2 },
            }}>
              {RECENT_VIDEOS.map((v, i) => (
                // Figma: each card w-[320px] min-w-[320px] shrink-0
                <Box key={v.title + i} sx={{ width: 320, minWidth: 320, flexShrink: 0 }}>
                  <VideoCard video={v} onClick={() => onSelectVideo(v)} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Folders ────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 24,
              lineHeight: 1.5, color: t.textPrimary,
            }}>
              Folders ({FOLDERS.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                borderColor: t.divider, color: t.textPrimary, fontSize: 14,
                fontFamily: '"Open Sans", sans-serif', textTransform: 'none',
                '&:hover': { borderColor: t.primaryMain, bgcolor: t.primarySelected },
              }}
            >
              New folder
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5, mb: 4 }}>
            {FOLDERS.map(f => <FolderCard key={f.name} name={f.name} count={f.count} />)}
          </Box>

          {/* ── Videos ─────────────────────────────────────────────────────── */}
          <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 24,
            lineHeight: 1.5, color: t.textPrimary, mb: 2,
          }}>
            Videos ({ALL_VIDEOS.length})
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2, pb: 4 }}>
            {ALL_VIDEOS.map((v, i) => (
              <VideoCard key={v.title + '-all-' + i} video={v} onClick={() => onSelectVideo(v)} />
            ))}
          </Box>

        </Box>
      </Box>
    </Box>
  )
}
