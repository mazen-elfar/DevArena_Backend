import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class PaymentsService {
  async createPayment(profileId, { type, amount, currency, gateway, metadata }) {
    const prisma = getPrisma();
    return prisma.payment.create({
      data: {
        profileId,
        type,
        amount,
        currency: currency || "USD",
        status: "PENDING",
        gateway,
        metadata: metadata || {},
      },
    });
  }

  async getPayments(profileId, { page, limit }) {
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where: { profileId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where: { profileId } }),
    ]);
    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getPayment(paymentId, profileId, isAdmin = false) {
    const prisma = getPrisma();
    const where = isAdmin ? { id: paymentId } : { id: paymentId, profileId };
    const payment = await prisma.payment.findFirst({ where });
    if (!payment) throw Errors.NotFound("Payment");
    return payment;
  }

  async updatePaymentStatus(paymentId, status, transactionRef) {
    const prisma = getPrisma();
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw Errors.NotFound("Payment");

    const data = { status };
    if (transactionRef) data.transactionRef = transactionRef;
    if (status === "COMPLETED") data.completedAt = new Date();

    return prisma.payment.update({ where: { id: paymentId }, data });
  }

  async requestPayout(profileId, { amount, method, accountRef }) {
    const prisma = getPrisma();

    const walletBalance = await prisma.payment.aggregate({
      where: { profileId, status: "COMPLETED", type: "PRIZE_PAYOUT" },
      _sum: { amount: true },
    });

    const withdrawals = await prisma.payout.aggregate({
      where: { profileId, status: { not: "FAILED" } },
      _sum: { amount: true },
    });

    const earned = Number(walletBalance._sum.amount || 0);
    const withdrawn = Number(withdrawals._sum.amount || 0);
    const available = earned - withdrawn;

    if (amount > available) {
      throw Errors.BadRequest(`Insufficient balance. Available: ${available}`);
    }

    return prisma.payout.create({
      data: {
        profileId,
        amount,
        status: "PENDING",
        method,
        accountRef,
      },
    });
  }

  async getPayouts(profileId, { page, limit }) {
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.payout.findMany({
        where: { profileId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payout.count({ where: { profileId } }),
    ]);
    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getSubscriptions(profileId) {
    const prisma = getPrisma();
    return prisma.subscription.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createSubscription(profileId, { plan, price }) {
    const prisma = getPrisma();

    const existing = await prisma.subscription.findFirst({
      where: { profileId, status: "ACTIVE" },
    });
    if (existing) throw Errors.Conflict("Already has an active subscription");

    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "MONTHLY") expiresAt.setMonth(expiresAt.getMonth() + 1);
    else expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return prisma.subscription.create({
      data: {
        profileId,
        plan,
        price,
        status: "ACTIVE",
        startsAt: now,
        expiresAt,
        autoRenew: true,
      },
    });
  }

  async cancelSubscription(subscriptionId, profileId) {
    const prisma = getPrisma();
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) throw Errors.NotFound("Subscription");
    if (subscription.profileId !== profileId) throw Errors.Forbidden();
    if (subscription.status !== "ACTIVE") throw Errors.BadRequest("Subscription is not active");

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED", autoRenew: false },
    });
  }
}
