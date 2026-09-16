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
} from "@react-email/components";

export interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const NAVY = "#123d32";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const LIGHT_BG = "#f1f5f9";

export function ContactEmail({ name, email, subject, message }: ContactEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        New contact: {subject} — from {name}
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
            backgroundColor: "#ffffff",
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
                  Contact Form Submission
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
                  Inbound
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── Alert banner ── */}
          <Section style={{ padding: "0 32px" }}>
            <div
              style={{
                margin: "28px 0 0",
                padding: "18px 22px",
                backgroundColor: "#edf1e7",
                borderLeft: "4px solid #245b45",
                borderRadius: "0 10px 10px 0",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: "22px",
                  lineHeight: 1,
                }}
              >
                📩
              </Text>
              <Text
                style={{
                  margin: "8px 0 0",
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#245b45",
                  lineHeight: 1.2,
                }}
              >
                New message from {name}
              </Text>
              <Text
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: MUTED,
                }}
              >
                via the Diplomaxdelivery contact form
              </Text>
            </div>
          </Section>

          {/* ── Contact details ── */}
          <Section style={{ padding: "24px 32px 0" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Sender Details
            </Text>

            <div
              style={{
                marginTop: "12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              {/* Name row */}
              <Row
                style={{
                  padding: "12px 18px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Column style={{ width: "100px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: MUTED,
                    }}
                  >
                    Name
                  </Text>
                </Column>
                <Column>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: TEXT,
                    }}
                  >
                    {name}
                  </Text>
                </Column>
              </Row>

              {/* Email row */}
              <Row
                style={{
                  padding: "12px 18px",
                  backgroundColor: "#ffffff",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Column style={{ width: "100px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: MUTED,
                    }}
                  >
                    Email
                  </Text>
                </Column>
                <Column>
                  <a
                    href={`mailto:${email}`}
                    style={{
                      color: "#245b45",
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {email}
                  </a>
                </Column>
              </Row>

              {/* Subject row */}
              <Row style={{ padding: "12px 18px", backgroundColor: "#f8fafc" }}>
                <Column style={{ width: "100px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: MUTED,
                    }}
                  >
                    Subject
                  </Text>
                </Column>
                <Column>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: TEXT,
                    }}
                  >
                    {subject}
                  </Text>
                </Column>
              </Row>
            </div>
          </Section>

          {/* ── Message ── */}
          <Section style={{ padding: "20px 32px 0" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Message
            </Text>
            <div
              style={{
                marginTop: "12px",
                padding: "18px 22px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: TEXT,
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message}
              </Text>
            </div>
          </Section>

          {/* ── Reply CTA ── */}
          <Section style={{ padding: "24px 32px 0" }}>
            <Button
              href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
              style={{
                backgroundColor: NAVY,
                color: "#ffffff",
                padding: "13px 28px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Reply to {name} →
            </Button>
          </Section>

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
              This email was automatically generated from the contact form at{" "}
              <a
                href="https://diplomaxdelivery.com/contact"
                style={{ color: "#245b45", textDecoration: "none" }}
              >
                diplomaxdelivery.com/contact
              </a>
              . Reply directly to this email to respond to the sender.
              <br />
              <br />© {new Date().getFullYear()} Diplomaxdelivery · Global Courier &amp;
              Logistics · All rights reserved.
            </Text>
          </Section>
        </Container>

        <Section style={{ padding: "0 0 32px" }} />
      </Body>
    </Html>
  );
}
