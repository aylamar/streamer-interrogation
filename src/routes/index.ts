// Import dependencies
import express from 'express';
const router = express.Router();

// Setup router
router.get('/', async (req, res) => {
    res.render('index');
});

// Export router
export default router;
