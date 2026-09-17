import * as React from "react";
import { X } from "lucide-react";
import { IntakeForm } from "@/components/forms/intake-form";

export function LiveChat() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 size-16 overflow-hidden rounded-full border-2 border-card shadow-lift sm:size-[4.5rem]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open live chat"
      >
        <img src="/images/chat-palm.jpg" alt="" className="size-full object-cover" width={1408} height={1408} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-navy-deep/40 p-4 sm:p-6" role="dialog" aria-label="Live chat">
          <div className="relative w-full max-w-md rounded-3xl bg-card p-5 shadow-lift">
            <button
              type="button"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full hover:bg-sky"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
            <h2 className="pr-10 font-display text-lg font-semibold text-navy">Talk with a campaign specialist</h2>
            <p className="mt-1 text-sm text-muted">Independent campaign — not a government agency. Share your name and number and we will follow up.</p>
            <div className="mt-4">
              <IntakeForm compact source="live-chat" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
