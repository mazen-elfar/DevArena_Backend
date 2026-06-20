import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class PaymentsService {
  async createPayment(userId, { type, amount, currency, gateway, metadata }) {
    const prisma = getPrisma();
    return prisma.payment.create({
      data: {
        userId,
        type,
        amount,
        currency: currency || "USD",
        status: "PENDING",
        gateway,
        metadata: metadata || {},
      },
    });
  }

  async getPayments(userId, { page, limit }) {
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getPayment(paymentId, userId, isAdmin = false) {
    const prisma = getPrisma();
    const where = isAdmin ? { id: paymentId } : { id: paymentId, userId };
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

  async requestPayout(userId, { amount, method, accountRef }) {
    const prisma = getPrisma();

    const walletBalance = await prisma.payment.aggregate({
      where: { userId, status: "COMPLETED", type: "PRIZE_PAYOUT" },
      _sum: { amount: true },
    });

    const withdrawals = await prisma.payout.aggregate({
      where: { userId, status: { not: "FAILED" } },
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
        userId,
        amount,
        status: "PENDING",
        method,
        accountRef,
      },
    });
  }

  async getPayouts(userId, { page, limit }) {
    const prisma = getPrisma();
    const [items, total] = await Promise.all([
      prisma.payout.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payout.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getSubscriptions(userId) {
    const prisma = getPrisma();
    return prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createSubscription(userId, { plan, price }) {
    const prisma = getPrisma();

    const existing = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (existing) throw Errors.Conflict("Already has an active subscription");

    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "MONTHLY") expiresAt.setMonth(expiresAt.getMonth() + 1);
    else expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return prisma.subscription.create({
      data: {
        userId,
        plan,
        price,
        status: "ACTIVE",
        startsAt: now,
        expiresAt,
        autoRenew: true,
      },
    });
  }

  async cancelSubscription(subscriptionId, userId) {
    const prisma = getPrisma();
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) throw Errors.NotFound("Subscription");
    if (subscription.userId !== userId) throw Errors.Forbidden();
    if (subscription.status !== "ACTIVE") throw Errors.BadRequest("Subscription is not active");

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED", autoRenew: false },
    });
  }
}
