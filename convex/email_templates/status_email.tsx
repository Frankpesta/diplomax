import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Hr,
  Preview,
  Img,
} from "@react-email/components";

export interface StatusHistoryEntry {
  status: string;
  createdAt: string;
}

export interface StatusEmailProps {
  recipientName: string;
  trackingCode: string;
  status: string;
  statusHistory?: StatusHistoryEntry[];
  publicUrl: string;
  senderCity?: string;
  receiverCity?: string;
  estimatedDeliveryDate?: string;
  isReceiver?: boolean;
}

type StatusConfig = {
  heading: string;
  detail: string;
  accent: string;
  icon: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  "Shipment Registered": {
    heading: "Your shipment has been registered",
    detail:
      "We've registered your shipment and assigned it a unique tracking number. Use the button below at any time to check real-time status updates.",
    accent: "#475569",
    icon: "📦",
  },
  "In Transit": {
    heading: "Your shipment is on its way",
    detail:
      "Your package is actively moving through our logistics network toward its destination. Track its exact location any time using the button below.",
    accent: "#d97706",
    icon: "✈️",
  },
  "Held at the Airport": {
    heading: "Your shipment is being held at the airport",
    detail:
      "Your package is currently held at an airport facility. We'll notify you as soon as it clears customs and continues its journey.",
    accent: "#6b8e52",
    icon: "🛬",
  },
};

const fallbackConfig: StatusConfig = {
  heading: "Shipment status update",
  detail:
    "There has been an update to your shipment. Use the button below to see the latest tracking information.",
  accent: "#475569",
  icon: "📋",
};

const NAVY = "#123d32";
const LIGHT_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const MUTED = "#64748b";
const TEXT = "#1e293b";

export function StatusEmail({
  recipientName,
  trackingCode,
  status,
  statusHistory,
  publicUrl,
  senderCity,
  receiverCity,
  estimatedDeliveryDate,
}: StatusEmailProps) {
  const cfg = STATUS_CONFIG[status] ?? fallbackConfig;
  // Newest first; only worth showing once there's more than the current status.
  const history = [...(statusHistory ?? [])].reverse();

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {trackingCode} — {cfg.heading}
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: LIGHT_BG,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "32px auto",
            backgroundColor: CARD_BG,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          }}
        >
          {/* ── Header ── */}
          <Section style={{ backgroundColor: NAVY, padding: "28px 32px 24px" }}>
            <Row>
              <Column>
                <Text
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                  }}
                >
                  Diplomaxdelivery
                </Text>
                <Text
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  Global Courier &amp; Logistics
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    margin: 0,
                    display: "inline-block",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  Shipment Update
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── Status banner ── */}
          <Section style={{ padding: "0 32px" }}>
            <div
              style={{
                margin: "28px 0 0",
                padding: "20px 22px",
                backgroundColor: "#f8fafc",
                borderLeft: `4px solid ${cfg.accent}`,
                borderRadius: "0 10px 10px 0",
              }}
            >
              <Text style={{ margin: 0, fontSize: "26px", lineHeight: 1 }}>
                {cfg.icon}
              </Text>
              <Text
                style={{
                  margin: "10px 0 0",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: cfg.accent,
                  lineHeight: 1.2,
                }}
              >
                {cfg.heading}
              </Text>
              {senderCity && receiverCity && (
                <Text
                  style={{
                    margin: "8px 0 0",
                    fontSize: "13px",
                    color: MUTED,
                    lineHeight: 1,
                  }}
                >
                  {senderCity} → {receiverCity}
                </Text>
              )}
              {estimatedDeliveryDate && (
                <Text
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    color: MUTED,
                    lineHeight: 1,
                  }}
                >
                  Estimated delivery:{" "}
                  <span style={{ color: TEXT, fontWeight: 700 }}>
                    {estimatedDeliveryDate}
                  </span>
                </Text>
              )}
            </div>
          </Section>

          {/* ── Body text ── */}
          <Section style={{ padding: "24px 32px 0" }}>
            <Text
              style={{ margin: 0, fontSize: "15px", color: TEXT, lineHeight: 1 }}
            >
              Dear <strong>{recipientName}</strong>,
            </Text>
            <Text
              style={{
                margin: "14px 0 0",
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.8",
              }}
            >
              {cfg.detail}
            </Text>
          </Section>

          {/* ── Track CTA ── */}
          <Section style={{ padding: "28px 32px 0" }}>
            <Button
              href={publicUrl}
              style={{
                backgroundColor: "#245b45",
                color: "#ffffff",
                padding: "14px 30px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Track Your Shipment →
            </Button>
          </Section>

          {/* ── Tracking code block ── */}
          <Section style={{ padding: "24px 32px 0" }}>
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: "10px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 600,
                }}
              >
                Your Tracking Number
              </Text>
              <Text
                style={{
                  margin: "8px 0 0",
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: "2px",
                  lineHeight: 1,
                }}
              >
                {trackingCode}
              </Text>
              <Text
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: MUTED,
                }}
              >
                Use this code to track your shipment at any time
              </Text>
            </div>
          </Section>

          {/* ── Status detail card ── */}
          <Section style={{ padding: "20px 32px 0" }}>
            <Row>
              <Column
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  width: "50%",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 600,
                  }}
                >
                  Current Status
                </Text>
                <Text
                  style={{
                    margin: "4px 0 0",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: cfg.accent,
                  }}
                >
                  {status}
                </Text>
              </Column>
              <Column style={{ width: "8px" }} />
              {estimatedDeliveryDate && (
                <Column
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    width: "50%",
                  }}
                >
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontWeight: 600,
                    }}
                  >
                    Est. Delivery
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: TEXT,
                    }}
                  >
                    {estimatedDeliveryDate}
                  </Text>
                </Column>
              )}
            </Row>
          </Section>

          {/* ── Shipment timeline ── */}
          {history.length > 1 && (
            <Section style={{ padding: "24px 32px 0" }}>
              <Text
                style={{
                  margin: "0 0 12px",
                  fontSize: "10px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 600,
                }}
              >
                Shipment Timeline
              </Text>
              {history.map((event, i) => (
                <Row key={i} style={{ marginBottom: i === history.length - 1 ? 0 : 12 }}>
                  <Column style={{ width: "22px", verticalAlign: "top" }}>
                    <div
                      style={{
                        marginTop: "4px",
                        width: "9px",
                        height: "9px",
                        borderRadius: "999px",
                        backgroundColor: i === 0 ? cfg.accent : "#cbd5e1",
                      }}
                    />
                  </Column>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 700,
                        color: i === 0 ? TEXT : MUTED,
                        lineHeight: 1.3,
                      }}
                    >
                      {event.status}
                    </Text>
                    <Text style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(event.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          <Hr
            style={{
              margin: "28px 32px 0",
              borderColor: "#e2e8f0",
              borderWidth: "1px",
            }}
          />

          {/* ── Footer ── */}
          <Section style={{ padding: "20px 32px 28px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#94a3b8",
                lineHeight: "1.7",
              }}
            >
              You&apos;re receiving this email because you are associated with an active
              shipment on Diplomaxdelivery. If you have any questions or need
              assistance, contact us at{" "}
              <a
                href="mailto:support@diplomaxdelivery.com"
                style={{ color: "#245b45", textDecoration: "none" }}
              >
                support@diplomaxdelivery.com
              </a>
              .
              <br />
              <br />© {new Date().getFullYear()} Diplomaxdelivery · Global Courier &amp;
              Logistics · All rights reserved.
            </Text>
          </Section>
        </Container>

        {/* Bottom padding */}
        <Section style={{ padding: "0 0 32px" }} />
      </Body>
    </Html>
  );
}

