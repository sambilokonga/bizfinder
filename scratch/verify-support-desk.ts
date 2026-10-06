import { getTickets, createTicket, addTicketMessage, updateTicket, getTicketById } from "../src/lib/db/queries/tickets";

async function runSupportDeskVerification() {
  console.log("🚀 Starting Support Desk Verification...\n");

  const testBizId = "biz-verify-101";
  const testUserId = "user_owner_test_99";

  // 1. Create a support ticket
  console.log("1️⃣ Testing Ticket Creation...");
  const newTicket = await createTicket({
    subject: "Automated Verification Test - Business License Document",
    category: "verification",
    priority: "critical",
    businessId: testBizId,
    businessName: "Addis Premier Roastery",
    userId: testUserId,
    userName: "Solomon Kassa",
    userEmail: "solomon@addisroastery.et",
    initialMessage: "Here is our renewed city trade license and TIN certificate for verification.",
    city: "Addis Ababa",
    country: "Ethiopia",
  });

  console.log(`✅ Created Ticket ID: ${newTicket.id} with status: ${newTicket.status}`);

  // 2. Fetch ticket by ID
  console.log("\n2️⃣ Fetching Ticket by ID...");
  const fetched = await getTicketById(newTicket.id);
  if (!fetched || fetched.id !== newTicket.id) {
    throw new Error("Failed to fetch ticket by ID");
  }
  console.log(`✅ Successfully fetched ticket #${fetched.id} with ${fetched.messages.length} message(s).`);

  // 3. Simulate Staff Reply (Admin Elena)
  console.log("\n3️⃣ Simulating Staff Reply & Notification Dispatch...");
  const updatedWithStaffReply = await addTicketMessage(newTicket.id, {
    senderId: "admin-elena",
    senderName: "Admin Elena (Compliance Desk)",
    senderRole: "admin",
    message: "Thank you Solomon. Your trade license has been verified. Verification badge is active!",
    newStatus: "resolved",
  });

  if (!updatedWithStaffReply) {
    throw new Error("Failed to append staff reply");
  }
  console.log(`✅ Appended staff message. Total messages: ${updatedWithStaffReply.messages.length}`);
  console.log(`✅ Ticket status updated to: ${updatedWithStaffReply.status}`);

  // 4. Update status to closed
  console.log("\n4️⃣ Testing Ticket Status Update via updateTicket...");
  const closedTicket = await updateTicket(newTicket.id, { status: "closed" });
  if (!closedTicket || closedTicket.status !== "closed") {
    throw new Error("Failed to close ticket");
  }
  console.log(`✅ Ticket #${closedTicket.id} status is now: ${closedTicket.status}`);

  // 5. Test Owner Reopening
  console.log("\n5️⃣ Testing Ticket Reopen Workflow...");
  const reopenedTicket = await updateTicket(newTicket.id, { status: "open" });
  if (!reopenedTicket || reopenedTicket.status !== "open") {
    throw new Error("Failed to reopen ticket");
  }
  console.log(`✅ Ticket #${reopenedTicket.id} reopened with status: ${reopenedTicket.status}`);

  // 6. Test Querying Tickets by Business
  console.log("\n6️⃣ Querying All Tickets for Business...");
  const { tickets, total } = await getTickets({
    businessId: testBizId,
    page: 1,
    limit: 20,
  });
  console.log(`✅ Found ${total} ticket(s) for businessId: ${testBizId}`);
  if (tickets.length === 0) {
    throw new Error("Expected at least 1 ticket for businessId");
  }

  console.log("\n🎉 ALL SUPPORT DESK VERIFICATIONS PASSED SUCCESSFULLY!");
}

runSupportDeskVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
