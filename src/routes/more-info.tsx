import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path from early emails — send people to /continue. */
export const Route = createFileRoute("/more-info")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : typeof search.id === "string" ? search.id : "",
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/continue",
      search: search.ref ? { id: search.ref } : {},
    });
  },
});
