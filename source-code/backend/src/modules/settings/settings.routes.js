const { Router } = require('express');
const service = require('./settings.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { authJwt, requireRole } = require('../../middlewares/auth');

const router = Router();

router.get(
  '/',
  authJwt,
  requireRole('LIBRARIAN', 'ADMIN'),
  asyncHandler(async (_req, res) => ok(res, await service.getAll()))
);

router.put(
  '/',
  authJwt,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => ok(res, await service.update(req.body), 'Đã cập nhật cấu hình'))
);

module.exports = router;
