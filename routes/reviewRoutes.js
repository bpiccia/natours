const express = require('express');
reviewController = require('../controllers/reviewController');
authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //Nested route

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .get(reviewController.getReview);

module.exports = router;
