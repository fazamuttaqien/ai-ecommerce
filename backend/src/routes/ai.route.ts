import { Router } from 'express';

import { aiChatController } from '../controllers/ai.controller';

const aiRoutes: Router = Router();

aiRoutes.post('/chat', aiChatController);

export default aiRoutes;
