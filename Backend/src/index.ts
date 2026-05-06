import cors from 'cors';
import jwt from 'jsonwebtoken';

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcrypt';

const JWT_SECRET = 'my_super_secret_key_123'
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

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 1. สร้าง "เกลือ" (Salt) เพื่อสุ่มความยากในการถอดรหัส
    const saltRounds = 10; 
    // 2. Hash รหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. บันทึก hashedPassword ลง Database (แทน password ตัวจริง)
    const user = await prisma.users.create({
        data: {
            username: username,
            password_hash: hashedPassword // เก็บตัวที่เขวี้ยงเข้าเครื่องปั่นแล้ว
        }
    });
    res.json({ message: "สมัครสมาชิกสำเร็จ!" });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. หา User ใน DB จากชื่อ
    const user = await prisma.users.findUnique({
        where: { username: username }
    });

    if (!user) {
        return res.status(401).json({ error: "ไม่พบผู้ใช้งานนี้" });
    }

    // 2. เทียบรหัสผ่าน (Bcrypt จะเอา password ตัวจริงไปปั่นแล้วเทียบกับใน DB ให้เอง)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
        // Login สำเร็จ! (เดี๋ยวเราจะมาทำเรื่องการส่ง Token ต่อ)
        const token = jwt.sign(
            { id: user.id, username: user.username},
            JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.json({ message: "Login สำเร็จ!", userId: user.id });
    } else {
        res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }
});