const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const switchService = require('../services/switch_service');
const passport = require('../middleware/passport');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/api/admin/switches',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const switches = await switchService.getAllForAdmin();
    res.json({ success: true, data: switches });
  })
);

router.get(
  '/api/admin/switches/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const switchId = parseInt(req.params.id, 10);
    const sw = await switchService.getByIdForAdmin(switchId);
    res.json({ success: true, switch: sw });
  })
);

router.post(
  '/api/admin/switches',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const created = await switchService.createSwitch(req.body);
    res.status(201).json({
      success: true,
      message: 'Свитч успешно добавлен',
      switch: created,
    });
  })
);

router.put(
  '/api/admin/switches/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const switchId = parseInt(req.params.id, 10);
    const updated = await switchService.updateSwitch(switchId, req.body);
    res.json({
      success: true,
      message: 'Свитч обновлён',
      switch: updated,
    });
  })
);

router.delete(
  '/api/admin/switches/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const switchId = parseInt(req.params.id, 10);
    await switchService.deleteSwitch(switchId);
    res.json({ success: true, message: 'Свитч удалён' });
  })
);

module.exports = router;
