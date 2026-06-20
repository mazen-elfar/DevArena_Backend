import { Router } from "express";
import { z } from "zod";
import { PaymentsController } from "./payments.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { requireMinRole } from "../../shared/middleware/rbac.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();
const controller = new PaymentsController();

const createPaymentSchema = z.object({
  type: z.enum(["TOURNAMENT_ENTRY", "SUBSCRIPTION", "STORE_PURCHASE", "PRIZE_PAYOUT"]),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  gateway: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"]),
  transactionRef: z.string().optional(),
});

const requestPayoutSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["BANK", "PAYPAL", "CRYPTO"]),
  accountRef: z.string().min(1),
});

const createSubscriptionSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
  price: z.number().positive(),
});

router.post("/", authenticate, validate(createPaymentSchema), (req, res, next) =>
  controller.createPayment(req, res, next),
);
router.get("/", authenticate, (req, res, next) => controller.getPayments(req, res, next));
router.get("/:id", authenticate, (req, res, next) => controller.getPayment(req, res, next));
router.put(
  "/:id/status",
  authenticate,
  requireMinRole("ADMIN"),
  validate(updateStatusSchema),
  (req, res, next) => controller.updatePaymentStatus(req, res, next),
);

router.post("/payouts", authenticate, validate(requestPayoutSchema), (req, res, next) =>
  controller.requestPayout(req, res, next),
);
router.get("/payouts", authenticate, (req, res, next) => controller.getPayouts(req, res, next));

router.get("/subscriptions", authenticate, (req, res, next) =>
  controller.getSubscriptions(req, res, next),
);
router.post(
  "/subscriptions",
  authenticate,
  validate(createSubscriptionSchema),
  (req, res, next) => controller.createSubscription(req, res, next),
);
router.put("/subscriptions/:id/cancel", authenticate, (req, res, next) =>
  controller.cancelSubscription(req, res, next),
);

export default router;
