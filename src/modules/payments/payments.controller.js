import { PaymentsService } from "./payments.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const paymentsService = new PaymentsService();

export class PaymentsController {
  async createPayment(req, res, next) {
    try {
      const payment = await paymentsService.createPayment(req.user.id, req.body);
      return sendSuccess(res, payment, "Payment created", 201);
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await paymentsService.getPayments(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const isAdmin = req.user.role === "ADMIN";
      const payment = await paymentsService.getPayment(req.params.id, req.user.id, isAdmin);
      return sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentStatus(req, res, next) {
    try {
      const { status, transactionRef } = req.body;
      const payment = await paymentsService.updatePaymentStatus(req.params.id, status, transactionRef);
      return sendSuccess(res, payment, "Payment status updated");
    } catch (error) {
      next(error);
    }
  }

  async requestPayout(req, res, next) {
    try {
      const payout = await paymentsService.requestPayout(req.user.id, req.body);
      return sendSuccess(res, payout, "Payout requested", 201);
    } catch (error) {
      next(error);
    }
  }

  async getPayouts(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await paymentsService.getPayouts(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req, res, next) {
    try {
      const subscriptions = await paymentsService.getSubscriptions(req.user.id);
      return sendSuccess(res, subscriptions);
    } catch (error) {
      next(error);
    }
  }

  async createSubscription(req, res, next) {
    try {
      const subscription = await paymentsService.createSubscription(req.user.id, req.body);
      return sendSuccess(res, subscription, "Subscription created", 201);
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const subscription = await paymentsService.cancelSubscription(req.params.id, req.user.id);
      return sendSuccess(res, subscription, "Subscription cancelled");
    } catch (error) {
      next(error);
    }
  }
}
