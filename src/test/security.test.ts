/// <reference types="vite/client" />
import { afterEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../convex/schema";
import { api, internal } from "../../convex/_generated/api";
import { provisionFirstAdmin } from "../../convex/lib/admin";
import { passwordProfile } from "../../convex/lib/authPolicy";
import { sendEmail } from "../../convex/lib/emailDelivery";
import { verifyContactChallenge } from "../../convex/lib/contactPolicy";
const modules = import.meta.glob("../../convex/**/*.{ts,tsx}");
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("server authorization", () => {
  it("closes provisioning after the initial admin and rolls back rejected users", async () => {
    const t = convexTest(schema, modules);
    await t.run(async ctx => { const id = await ctx.db.insert("users", {email:"first@example.com"}); await provisionFirstAdmin(ctx,id); });
    await expect(t.run(async ctx => { const id = await ctx.db.insert("users", {email:"second@example.com"}); await provisionFirstAdmin(ctx,id); })).rejects.toThrow("closed");
    expect(await t.run(ctx => ctx.db.query("users").collect())).toHaveLength(1);
  });
  it("requires the private setup key only for signup and never stores it in the profile", () => {
    vi.stubEnv("ADMIN_SETUP_KEY", "a".repeat(32));
    const input = {flow:"signUp",email:" ADMIN@example.com ",name:"Admin"};
    expect(() => passwordProfile(input)).toThrow("setup");
    expect(passwordProfile({...input,setupKey:"a".repeat(32)})).toEqual({email:"admin@example.com",name:"Admin"});
    expect(passwordProfile({flow:"signIn",email:input.email})).toEqual({email:"admin@example.com"});
  });
  it("blocks anonymous and ordinary authenticated users on private queries", async () => {
    const t = convexTest(schema, modules);
    const id = await t.run(ctx => ctx.db.insert("users", {email:"user@example.com"}));
    const user = t.withIdentity({subject:`${id}|session`});
    for (const client of [t,user]) {
      await expect(client.query(api.shipments.getDashboardMetrics, {})).rejects.toThrow(/required/);
      await expect(client.query(api.shipments.getRecentShipments, {})).rejects.toThrow(/required/);
      await expect(client.query(api.shipments.getAnalyticsData, {})).rejects.toThrow(/required/);
      await expect(client.query(api.notificationJobs.list, {})).rejects.toThrow(/required/);
    }
    await t.run(ctx => provisionFirstAdmin(ctx,id));
    expect(await user.query(api.notificationJobs.list, {})).toEqual([]);
    expect(await t.query(api.shipments.getShipmentByTrackingCode,{trackingCode:"GOX-2026-123456"})).toBeNull();
  });
});
describe("persistent contact controls", () => {
  it("limits each email to three attempts and resets at the next hour", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-16T12:10:00Z"));
    const t = convexTest(schema,modules);
    for(let i=0;i<3;i++) expect(await t.mutation(internal.contactLimits.consume,{emailHash:"one"})).toBe(true);
    expect(await t.mutation(internal.contactLimits.consume,{emailHash:"one"})).toBe(false);
    expect(await t.mutation(internal.contactLimits.consume,{emailHash:"two"})).toBe(true);
    vi.setSystemTime(new Date("2026-09-16T13:00:00Z"));
    expect(await t.mutation(internal.contactLimits.consume,{emailHash:"one"})).toBe(true);
  });
  it("limits rotated email addresses to a global hourly budget", async () => {
    const t=convexTest(schema,modules);
    for(let i=0;i<100;i++) expect(await t.mutation(internal.contactLimits.consume,{emailHash:String(i)})).toBe(true);
    expect(await t.mutation(internal.contactLimits.consume,{emailHash:"new"})).toBe(false);
  });
  it.each([{success:false},{success:true,hostname:"evil.example",action:"contact"},{success:true,hostname:"diplomaxdelivery.com",action:"login"}])("rejects invalid Turnstile responses %j", async result => {
    vi.stubEnv("TURNSTILE_SECRET_KEY","test");
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json(result)));
    await expect(verifyContactChallenge("token")).rejects.toThrow("failed");
  });
  it("accepts only a verified challenge for this host and action",async()=>{
    vi.stubEnv("TURNSTILE_SECRET_KEY","test");
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({success:true,hostname:"diplomaxdelivery.com",action:"contact"})));
    await expect(verifyContactChallenge("token")).resolves.toBeUndefined();
  });
});
describe("provider acceptance",()=>{
  const message={from:"test@example.com",to:["recipient@example.com"],subject:"Test",html:"Test"};
  it.each([429,500,503])("retries temporary HTTP %s failures", async status=>{
    vi.stubEnv("RESEND_API_KEY","test"); vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({message:"failed"},{status})));
    await expect(sendEmail(message)).rejects.toMatchObject({retryable:true});
  });
  it("does not claim success for an error payload with HTTP 200",async()=>{
    vi.stubEnv("RESEND_API_KEY","test"); vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({error:{message:"failed"}})));
    await expect(sendEmail(message)).rejects.toThrow("did not accept");
  });
  it("classifies validation errors as permanent",async()=>{
    vi.stubEnv("RESEND_API_KEY","test"); vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({message:"invalid"},{status:422})));
    await expect(sendEmail(message)).rejects.toMatchObject({retryable:false});
  });
  it("reuses the job idempotency key and returns provider acceptance",async()=>{
    vi.stubEnv("RESEND_API_KEY","test"); const fetcher=vi.fn().mockResolvedValue(Response.json({id:"accepted-id"})); vi.stubGlobal("fetch",fetcher);
    expect(await sendEmail(message,"stable-job-key")).toBe("accepted-id");
    expect(fetcher.mock.calls[0][1].headers["Idempotency-Key"]).toBe("stable-job-key");
  });
});

describe("shipment notification persistence",()=>{
  async function fixture() {
    const t=convexTest(schema,modules);
    const shipmentId=await t.run(ctx=>ctx.db.insert("shipments",{
      trackingCode:"DMD-2026-123456",status:"In Transit",shipmentType:"Air",
      shippingCost:10,tax:0,insurance:0,totalCost:10,weight:1,length:1,width:1,height:1,
      senderFullName:"Sender",senderEmail:"sender@example.com",senderPhone:"123",senderAddress:"Sender address",senderCity:"London",senderState:"London",senderCountry:"UK",senderPostalCode:"A1",
      receiverFullName:"Receiver",receiverEmail:"receiver@example.com",receiverPhone:"456",receiverAddress:"Receiver address",receiverCity:"Lagos",receiverState:"Lagos",receiverCountry:"Nigeria",receiverPostalCode:"100001",
      archived:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    }));
    const jobId=await t.run(ctx=>ctx.db.insert("notificationJobs",{shipmentId,recipient:"receiver@example.com",recipientName:"Receiver",isReceiver:true,trackingCode:"DMD-2026-123456",shipmentStatus:"In Transit",publicUrl:"https://diplomaxdelivery.com/track/DMD-2026-123456",state:"queued",attempts:0,createdAt:Date.now(),dueAt:Date.now()}));
    return {t,shipmentId,jobId};
  }
  it("exposes approved full details by code while blocking direct ID and route reads",async()=>{
    const {t,shipmentId}=await fixture();
    const result=await t.query(api.shipments.getShipmentByTrackingCode,{trackingCode:"DMD-2026-123456"});
    expect(result?.receiverEmail).toBe("receiver@example.com");
    expect(result?.senderAddress).toBe("Sender address");
    await expect(t.query(api.shipments.getShipmentById,{id:shipmentId})).rejects.toThrow("required");
    await expect(t.query(api.routes.getRouteCheckpoints,{shipmentId})).rejects.toThrow("required");
    await expect(t.query(api.auditLogs.getShipmentAuditLogs,{shipmentId})).rejects.toThrow("required");
    await expect(t.mutation(api.shipments.deleteShipment,{id:shipmentId})).rejects.toThrow("required");
  });
  it("claims only once and never loses the shipment when email permanently fails",async()=>{
    const {t,shipmentId,jobId}=await fixture();
    expect((await t.mutation(internal.notificationJobs.claim,{jobId}))?.attempts).toBe(1);
    expect(await t.mutation(internal.notificationJobs.claim,{jobId})).toBeNull();
    await t.mutation(internal.notificationJobs.finish,{jobId,attempt:1,error:"invalid sender",retryable:false});
    expect((await t.run(ctx=>ctx.db.get(jobId)))?.state).toBe("failed");
    expect(await t.run(ctx=>ctx.db.get(shipmentId))).not.toBeNull();
  });
  it("retries temporary failures and stops after four attempts",async()=>{
    vi.useFakeTimers();
    const {t,jobId}=await fixture();
    for(let attempt=1;attempt<=4;attempt++) {
      await t.run(ctx=>ctx.db.patch(jobId,{dueAt:Date.now()}));
      expect((await t.mutation(internal.notificationJobs.claim,{jobId}))?.attempts).toBe(attempt);
      await t.mutation(internal.notificationJobs.finish,{jobId,attempt,error:"temporary",retryable:true});
      expect((await t.run(ctx=>ctx.db.get(jobId)))?.state).toBe(attempt<4?"retrying":"failed");
    }
    vi.clearAllTimers();
  });
  it("ignores stale attempt results after provider acceptance",async()=>{
    const {t,jobId}=await fixture();
    await t.mutation(internal.notificationJobs.claim,{jobId});
    await t.mutation(internal.notificationJobs.finish,{jobId,attempt:1,providerId:"accepted",retryable:false});
    await t.mutation(internal.notificationJobs.finish,{jobId,attempt:1,error:"late",retryable:true});
    expect((await t.run(ctx=>ctx.db.get(jobId)))?.state).toBe("accepted");
  });
  it("does not resend outside the idempotency window",async()=>{
    const {t,jobId}=await fixture();
    await t.run(ctx=>ctx.db.patch(jobId,{createdAt:Date.now()-24*60*60*1000}));
    expect(await t.mutation(internal.notificationJobs.claim,{jobId})).toBeNull();
    expect((await t.run(ctx=>ctx.db.get(jobId)))?.state).toBe("failed");
  });
});
