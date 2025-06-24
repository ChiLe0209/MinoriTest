// routes/category.routes.js
const express = require('express');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller');

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;