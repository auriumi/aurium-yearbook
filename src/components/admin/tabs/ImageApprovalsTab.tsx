"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Loader2, ChevronLeft, ChevronRight, GraduationCap, Sparkles, Clock,
  CheckCircle2, XCircle, MessageSquare, Send, Check, X, Inbox, Calendar, ListFilter,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useImageApprovals } from "@/hooks/useImageApprovals";
import { fetchThread, postComment, decideImage } from "@/app/admin/imageService";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-100 text-amber-800 border-amber-200", Icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200", Icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200",       Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${cfg.className}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "2-digit", hour: "numeric", minute: "2-digit" });
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (!p[0]) return "?";
  return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase();
}

interface ImageApprovalsTabProps {
  isApprover: boolean;
  focusImageId?: number | null;
  onConsumeFocus?: () => void;
}

export function ImageApprovalsTab({ isApprover, focusImageId, onConsumeFocus }: ImageApprovalsTabProps) {
  const {
    view, setView, typeFilter, setTypeFilter, yearFilter, setYearFilter,
    page, setPage, items, totalResults, isLoading, ITEMS_PER_PAGE, refresh, YEAR_OPTIONS,
  } = useImageApprovals(isApprover);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [request, setRequest] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const loadThread = useCallback(async (id: number) => {
    setLoadingThread(true);
    const res = await fetchThread(id);
    if (res.success && res.data) {
      setRequest(res.data.request);
      setComments(res.data.comments ?? []);
    } else {
      toast.error(res.reason ?? "Could not load this request.");
      setRequest(null);
      setComments([]);
    }
    setLoadingThread(false);
  }, []);

  const openDetail = useCallback((id: number) => {
    setSelectedId(id);
    setText("");
    setRequest(null);
    setComments([]);
    loadThread(id);
  }, [loadThread]);

  const closeDetail = () => {
    if (busy) return;
    setSelectedId(null);
    setRequest(null);
    setComments([]);
    setText("");
  };

  // open a request directly when arriving from a notification deep-link
  useEffect(() => {
    if (focusImageId) {
      openDetail(focusImageId);
      onConsumeFocus?.();
    }
  }, [focusImageId, openDetail, onConsumeFocus]);

  const handleComment = async () => {
    if (!selectedId || !text.trim()) return;
    setBusy(true);
    const res = await postComment(selectedId, text.trim());
    if (res.success) {
      setText("");
      await loadThread(selectedId);
    } else {
      toast.error(res.reason ?? "Could not post comment.");
    }
    setBusy(false);
  };

  const handleDecision = async (action: "APPROVE" | "REJECT") => {
    if (!selectedId) return;
    const note = text.trim();
    if (action === "REJECT" && !note) {
      toast.error("A reason is required to reject.");
      return;
    }
    setBusy(true);
    const res = await decideImage(selectedId, action, note || undefined);
    if (res.success) {
      toast.success(action === "APPROVE" ? "Image approved." : "Image rejected.");
      setText("");
      await loadThread(selectedId);
      refresh();
    } else {
      toast.error(res.reason ?? "Could not complete the action.");
    }
    setBusy(false);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 4;
    let end = Math.min(totalPages, Math.max(1, page - 1) + maxButtons - 1);
    const start = Math.max(1, end - maxButtons + 1);
    end = Math.min(totalPages, start + maxButtons - 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const studentName = (s: any) =>
    s ? `${s.last_name ?? ""}, ${s.first_name ?? ""} ${s.mid_name?.charAt(0) ? s.mid_name.charAt(0) + "." : ""} ${s.suffix ?? ""}`.trim() : "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header + filters (approvers only) */}
      {isApprover && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Inbox className="h-6 w-6 text-amber-600" /> Image Approvals
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Review submitted graduation and theme photos and discuss in the thread to approve or reject request.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            {/* View toggle */}
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 shrink-0">
              {(["PENDING", "RESOLVED"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 h-10 text-sm font-semibold rounded-md transition-colors ${view === v ? "bg-white text-amber-800 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                >
                  {v === "PENDING" ? "Pending" : "Resolved"}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Type filter */}
            <div className="w-full sm:w-[160px] shrink-0">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 w-full bg-white border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                    <ListFilter size={16} className="shrink-0" />
                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                      <SelectValue placeholder="Type" />
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="GRADUATION">Graduation</SelectItem>
                  <SelectItem value="THEME">Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year filter */}
            <div className="w-full sm:w-[130px] shrink-0">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-10 w-full bg-white border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                    <Calendar size={16} className="shrink-0" />
                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                      <SelectValue placeholder="Year" />
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Queue (approvers only) */}
      {isApprover && (
        <div className="space-y-4 pb-10 min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
              <Loader2 className="h-8 w-8 mb-4 text-amber-500 animate-spin" />
              <p className="text-sm font-medium">Loading requests...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
              <Inbox className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-stone-500">{view === "PENDING" ? "Nothing to review" : "No resolved requests"}</p>
              <p className="text-sm">{view === "PENDING" ? "New uploads will appear here." : "Approved/rejected images show up here."}</p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {items.map((req: any) => {
                  const TypeIcon = req.type === "GRADUATION" ? GraduationCap : Sparkles;
                  return (
                    <button
                      key={req.id}
                      onClick={() => openDetail(req.id)}
                      className="text-left bg-[#FDFBF7] p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all flex gap-3"
                    >
                      <div className="relative w-20 aspect-[3/4] shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                        {req.photo_url ? (
                          <Image unoptimized src={req.photo_url} fill sizes="80px" className="object-cover" alt="pending" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-300"><ImageOff size={18} /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            <TypeIcon size={12} /> {req.type === "GRADUATION" ? "Grad" : "Theme"} · {req.year}
                          </span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-sm font-bold text-stone-800 truncate mt-1">{studentName(req.student)}</p>
                        <p className="text-[11px] font-mono text-stone-500">{req.student?.student_number}</p>
                        <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-stone-400">
                          <span className="truncate">by {req.uploader_name || "—"}</span>
                          <span className="inline-flex items-center gap-1 shrink-0"><MessageSquare size={11} /> {req.comment_count}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                  <span className="text-xs text-stone-400 font-medium hidden sm:block">
                    Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalResults)} of {totalResults}
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                      {getPageNumbers().map(n => (
                        <Button key={n} variant={page === n ? "default" : "outline"} className={`h-8 w-8 text-xs rounded-lg shrink-0 ${page === n ? "bg-amber-600 hover:bg-amber-700 shadow-sm" : "text-stone-500"}`} onClick={() => setPage(n)}>
                          {n}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Non-approver landing (reached via a notification deep-link) */}
      {!isApprover && !selectedId && (
        <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
          <Inbox className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-500">Open a notification to view a request</p>
          <p className="text-sm">You can view and reply on requests you uploaded.</p>
        </div>
      )}

      {/* Forum detail dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => { if (!open) closeDetail(); }}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col md:flex-row">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Review</DialogTitle>
            <DialogDescription>Review and discuss the submitted image.</DialogDescription>
          </DialogHeader>

          {loadingThread ? (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : request ? (
            <>
              {/* Left: images + meta */}
              <div className="md:w-[42%] bg-stone-50 border-b md:border-b-0 md:border-r border-stone-200 p-5 overflow-y-auto shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                    {request.type === "GRADUATION" ? <GraduationCap size={14} /> : <Sparkles size={14} />}
                    {request.type === "GRADUATION" ? "Graduation" : "Theme"} · {request.year}
                  </span>
                  <StatusBadge status={request.status} />
                </div>

                <p className="text-sm font-bold text-stone-800">{studentName(request.student)}</p>
                <p className="text-[11px] font-mono text-stone-500 mb-3">{request.student?.student_number}</p>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1">Submitted</p>
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
                        onClick={() => {
                          const refUrl = request.photo_url;
                          if (refUrl) setEnlargedImage(refUrl);
                        }}
                    >
                      {request.photo_url ? (
                        <Image unoptimized src={request.photo_url} fill sizes="240px" className="object-cover" alt="submitted" />
                      ) : <div className="absolute inset-0 flex items-center justify-center text-stone-300"><ImageOff size={20} /></div>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1">Reference</p>
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
                        onClick={() => {
                          const refUrl = request.reference_photo_url;
                          if (refUrl) setEnlargedImage(refUrl);
                        }}
                    >
                      {request.reference_photo_url ? (
                        <Image unoptimized src={request.reference_photo_url} fill sizes="240px" className="object-cover" alt="reference" />
                      ) : <div className="absolute inset-0 flex items-center justify-center text-stone-300"><ImageOff size={20} /></div>}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 mt-3">Uploaded by {request.uploader_name || "—"}</p>
              </div>

              {/* Right: thread + composer */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-2 shrink-0">
                  <MessageSquare size={15} className="text-stone-400" />
                  <p className="text-sm font-bold text-stone-700">Discussion</p>
                  <span className="text-xs text-stone-400">({comments.length})</span>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                  {comments.length === 0 && (
                    <p className="text-center text-xs text-stone-400 py-8">No comments yet. Start the discussion below.</p>
                  )}
                  {comments.map((c) => (
                    c.is_system ? (
                      <div key={c.id} className="flex items-center gap-2 justify-center">
                        <span className={c.body.slice(0, 8) !== "Rejected" 
                          ? "text-[11px] font-semibold bg-green-100 text-green-800 border-green-200 rounded-full px-3 py-1"
                          : "text-[11px] bg-red-100 text-red-700 border-red-200 rounded-full px-3 py-1"
                        }>
                          {c.body.slice(0, -1)}. Authored by {c.author_name} · {fmtTime(c.created_at)}
                        </span>
                      </div>
                    ) : (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {initials(c.author_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-700">{c.author_name || "Unknown"}</span>
                            {c.author_role && <span className="text-[9px] uppercase tracking-wide text-stone-400">{c.author_role}</span>}
                            <span className="text-[10px] text-stone-400">{fmtTime(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-stone-700 mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Composer + decisions */}
                <div className="border-t border-stone-100 p-4 space-y-2 shrink-0">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isApprover && request.status === "PENDING"
                      ? "Write a comment, or add a note for your decision…"
                      : "Write a comment…"}
                    className="resize-none text-sm min-h-[64px] focus-visible:ring-amber-500/30"
                    disabled={busy}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={handleComment} disabled={busy || !text.trim()} className="border-stone-200">
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Comment
                    </Button>

                    {isApprover && request.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleDecision("REJECT")} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
                          <X className="w-3.5 h-3.5 mr-1.5" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleDecision("APPROVE")} disabled={busy} className="bg-green-600 hover:bg-green-700 text-white">
                          <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                  {isApprover && request.status === "PENDING" && (
                    <p className="text-[10px] text-stone-400">A note is required to reject; optional when approving.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">Request unavailable.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* IMAGE LIGHTBOX MODAL */}
      <Dialog open={!!enlargedImage} onOpenChange={(open) => !open && setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl w-auto p-1 bg-transparent border-0 shadow-none flex justify-center items-center [&>button]:hidden">
          <div className="relative w-auto h-auto max-h-[85vh]">
            {enlargedImage && (
              <Image
                unoptimized
                src={enlargedImage}
                alt="Enlarged view"
                width={1600}
                height={2000}
                className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
