import * as React from "react";
import { MessageCircle, X } from "lucide-react";
import { IntakeForm } from "@/components/forms/intake-form";

export function LiveChat() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-coral px-5 text-sm font-bold text-white shadow-lift"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCircle className="size-4" />
        Live Chat
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-navy-deep/40 p-4 sm:p-6" role="dialog" aria-label="Live chat">
          <div className="relative w-full max-w-md rounded-xl bg-card p-5 shadow-lift">
            <button
              type="button"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full hover:bg-sky"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
            <h2 className="pr-10 text-lg font-bold text-navy">Talk with a campaign specialist</h2>
            <p className="mt-1 text-sm text-muted">This is not SSA. Share your name and number and we will follow up.</p>
            <div className="mt-4">
              <IntakeForm compact source="live-chat" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
