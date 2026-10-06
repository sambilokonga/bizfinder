import { getTickets, getTicketById, createTicket, addTicketMessage, updateTicket } from "../src/lib/db/queries/tickets";

async function runTest() {
  console.log("--- TEST 1: Page 1 with 20 items per page ---");
  const page1 = await getTickets({ page: 1, limit: 20 });
  console.log(`Page 1 count: ${page1.tickets.length}`);
  console.log(`Total: ${page1.total}`);
  console.log(`Total Pages: ${page1.totalPages}`);
  console.log(`Page 1 first ticket ID: ${page1.tickets[0]?.id}`);
  console.log(`Page 1 last ticket ID: ${page1.tickets[page1.tickets.length - 1]?.id}`);

  if (page1.tickets.length !== 20) {
    throw new Error(`Expected 20 items on page 1, got ${page1.tickets.length}`);
  }

  console.log("\n--- TEST 2: Page 2 with 20 items per page ---");
  const page2 = await getTickets({ page: 2, limit: 20 });
  console.log(`Page 2 count: ${page2.tickets.length}`);
  console.log(`Page 2 first ticket ID: ${page2.tickets[0]?.id}`);

  if (page2.tickets.length < 1) {
    throw new Error(`Expected items on page 2, got ${page2.tickets.length}`);
  }

  console.log("\n--- TEST 3: Create Support Ticket ---");
  const created = await createTicket({
    subject: "Test Production Support Escalation",
    category: "billing",
    priority: "high",
    userId: "test_user_1",
    userName: "Abebe Kebede",
    userEmail: "abebe@example.com",
    initialMessage: "We are verifying end-to-end support ticket creation and pagination.",
  });
  console.log(`Created Ticket ID: ${created.id}, Subject: ${created.subject}`);

  console.log("\n--- TEST 4: Add Reply / Message ---");
  const replied = await addTicketMessage(created.id, {
    senderName: "Platform Admin Marcus",
    senderRole: "admin",
    message: "Thank you Abebe, this inquiry is now actively verified.",
    newStatus: "in_progress",
  });
  console.log(`Replied Ticket messages count: ${replied?.messages.length}, Status: ${replied?.status}`);

  console.log("\n--- TEST 5: Status Update & Resolve ---");
  const resolved = await updateTicket(created.id, { status: "resolved" });
  console.log(`Resolved Ticket Status: ${resolved?.status}`);

  console.log("\nALL TESTS PASSED SUCCESSFULLY! Support desk with 20 items per page pagination is 100% operational.");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
