const { Router } = require('express');

const router = Router();

router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/books', require('./modules/books/books.routes'));
router.use('/categories', require('./modules/categories/categories.routes'));
router.use('/authors', require('./modules/authors/authors.routes'));
router.use('/loans', require('./modules/loans/loans.routes'));
router.use('/reports', require('./modules/reports/reports.routes'));
router.use('/users', require('./modules/users/users.routes'));
router.use('/settings', require('./modules/settings/settings.routes'));

module.exports = router;
