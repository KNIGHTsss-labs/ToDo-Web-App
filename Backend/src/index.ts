import cors from 'cors';

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors()); // 2. บรรทัดนี้ต้องอยู่ "ก่อน" app.get หรือ app.post ทุกอันครับ

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

// ค้นหา Task โดยใช้ Username
app.get('/tasks/:username', async (req: Request, res: Response) => {
    const { username } = req.params as {username: string };
    try {
        // 1. หา User คนนี้ก่อนว่ามีตัวตนไหม
        const user = await prisma.users.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(404).json({ error: "ไม่พบชื่อผู้ใช้งานนี้" });
        }

        // 2. ดึง Task ของ User คนนั้นออกมา
        const userTasks = await prisma.tasks.findMany({
            where: { user_id: user.id }
        });

        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

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