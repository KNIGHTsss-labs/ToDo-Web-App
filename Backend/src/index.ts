import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.get('/users', async (req: Request, res: Response) => {
    try {
        const allUsers = await prisma.users.findMany();
        res.json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 1. ดู Task ทั้งหมดของทุกคน
app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const allTasks = await prisma.tasks.findMany(); // 'tasks' ต้องตรงกับชื่อ model ใน schema
        res.json(allTasks);
    } catch (error) {
        res.status(500).json({ error: "ดึงข้อมูล Task ไม่ได้" });
    }
});

// 2. (ขั้นเทพ) ดู Task เฉพาะของ User คนนั้นๆ
app.get('/users/:userId/tasks', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const userTasks = await prisma.tasks.findMany({
            where: {
                user_id: Number(userId) // กรองหาเฉพาะงานของ user id นี้
            }
        });
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: "หา Task ของ User คนนี้ไม่เจอ" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});