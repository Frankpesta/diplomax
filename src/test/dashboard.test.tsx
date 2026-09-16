import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getFunctionName } from "convex/server";
import { useQuery } from "convex/react";
import Dashboard from "../app/(admin)/admin/(dashboard)/dashboard/page";
import DashboardLayout from "../app/(admin)/admin/(dashboard)/layout";
import { TooltipProvider } from "../components/ui/tooltip";
import type { ReactNode } from "react";

vi.mock("convex/react", () => ({ useQuery: vi.fn() }));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signOut: vi.fn() }) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/dashboard", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children, href, ...props }: { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a> }));
const fixture = {
  metrics: { totalShipments: 24, registeredShipments: 8, inTransitShipments: 12, heldAtAirportShipments: 4, archivedShipments: 0, totalRevenue: 1250 },
  recent: [{ _id: "preview-shipment", trackingCode: "DMD-2026-100001", senderCity: "Origin city", receiverCity: "Destination city", status: "In Transit", shipmentType: "Express", totalCost: 125, createdAt: "2026-09-16T09:00:00Z" }],
};
function configure(loading = false, empty = false) {
  vi.mocked(useQuery).mockImplementation((...args) => {
    const name = getFunctionName(args[0]);
    if (name === "users:getCurrentUser") return { name: "Operations Team", email: "team@example.test" };
    if (loading) return undefined;
    if (name === "shipments:getDashboardMetrics") return fixture.metrics;
    if (name === "shipments:getRecentShipments") return empty ? [] : fixture.recent;
    return undefined;
  });
}
describe("Dashboard presentation with isolated data", () => {
  beforeEach(() => vi.clearAllMocks());
  it("renders supplied metrics, shipment links, and the branded navigation", async () => {
    configure();
    const html = renderToStaticMarkup(<TooltipProvider><DashboardLayout><Dashboard /></DashboardLayout></TooltipProvider>);
    expect(html).toContain("1,250.00");
    expect(html).toContain("DMD-2026-100001");
    expect(html).toContain('href="/admin/shipments/DMD-2026-100001"');
    expect(html).toContain('href="/admin/shipments/new"');
    expect(html).toContain("Diplomaxdelivery");
    if (process.env.DIPLOMAX_RENDER_PREVIEW === "1") {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const dir = path.resolve(".next/static/chunks");
      const css = fs.readdirSync(dir).filter(name => name.endsWith(".css")).map(name => `<link rel="stylesheet" href="/_next/static/chunks/${name}" />`).join("");
      fs.writeFileSync("public/dashboard-design-review.html", `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Dashboard design review - fixture data only</title>${css}</head><body><div style="padding:8px;text-align:center;background:#c7f36b;color:#123d32;font:12px sans-serif">Design review · illustrative test data · no backend connection</div>${html}</body></html>`);
    }
  });
  it("shows a loading state instead of invented shipment data", () => {
    configure(true);
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toContain("Loading");
    expect(html).not.toContain("DMD-2026-100001");
  });
  it("offers shipment creation when no shipments exist", () => {
    configure(false, true);
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toContain("No shipments yet.");
    expect(html).toContain("Create your first shipment");
  });
});


