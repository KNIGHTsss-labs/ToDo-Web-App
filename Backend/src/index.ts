import 'dotenv/config' // must be first
import cors from 'cors';

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import rateLimit from 'express-rate-limit'

// Explicitly set env before Prisma loads
process.env.DATABASE_URL = process.env.DATABASE_URL ?? ''

const JWT_SECRET = process.env.JWT_SECRET!
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as String})
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(cors()); // allows all website to call your API
app.use(express.json());

const port = 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
})
app.use('/login', limiter)
app.use('/register', limiter)

// ─── AUTH ─────────────────────────────────────
const authenticate = (req: any, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token){
        return res.status(401).json({ error: 'กรุณา Login ก่อน' })
    }
    try {
        const decode = jwt.verify(token, JWT_SECRET) as any;

        req.user = decode;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' })
    }
};

// ─── TASKs ─────────────────────────────────────
// R : Read
app.get('/tasks', authenticate, async (req: any, res: Response) => {
    try{
        const tasks = await prisma.tasks.findMany({
            where: {user_id: req.user.id },
            orderBy: { created_at: 'desc'}
        });
        res.json(tasks)
    } catch (error){
        res.status(500).json({ error: 'ดึง task ไม่สำเร็จ' });
    }
});

// C : Create
app.post('/tasks', authenticate, async (req: any, res: Response) => {
    const { title, description, due_date, priority } = req.body;
    console.log('PRIORITY RECEIVED: ', priority)
    if (!title) return res.status(400).json({ error: 'กรุณาใส่ชื่อ task' });

    try{
        const task = await prisma.tasks.create({
            data: {
                title,
                description: description || null,
                due_date: due_date ? new Date(due_date) : null,
                priority: priority || 'medium',
                user_id: req.user.id
            }
        });
        res.status(201).json(task)
    } catch (error){
        console.error('CREATE TASK ERROR:',error)
        res.status(500).json({ error: error});
    }
});

// U : Update, put
app.put('/tasks/:id', authenticate, async (req: any, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, description, is_completed, due_date, priority } = req.body;

    try{
        const task = await prisma.tasks.findFirst({
            where: {id, user_id: req.user.id}
        });
        if (!task) return res.status(404).json({ error: 'ไม่พบ task นี้' });

        const update = await prisma.tasks.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(is_completed !== undefined && { is_completed }),
                ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
                ...(priority !== undefined && { priority }),
            }
        });
        res.json(update);
    } catch (error){
        res.status(500).json({ error: 'แก้ไข task ไม่สำเร็จ'})
    } 
});

// Toggle complete
app.patch('/tasks/:id/toggle', authenticate, async (req: any, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const task = await prisma.tasks.findFirst({
            where: { id, user_id: req.user.id }
        });
        if (!task) return res.status(404).json({ error: 'ไม่พบ task นี้' });

        const updated = await prisma.tasks.update({
            where: { id },
            data: { is_completed: !task.is_completed } // flip true→false or false→true
        });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'toggle task ไม่สำเร็จ' });
    }
});

// D : Delete
app.delete('/tasks/:id', authenticate, async (req: any, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const task = await prisma.tasks.findFirst({
            where: { id, user_id: req.user.id }
        });
        if (!task) return res.status(404).json({ error: 'ไม่พบ task นี้' });

        await prisma.tasks.delete({ where: { id } });
        res.json({ message: 'ลบ task สำเร็จ' });
    } catch {
        res.status(500).json({ error: 'ลบ task ไม่สำเร็จ' });
    }
});

// app.get('/users', async (req: Request, res: Response) => {
//     try {
//         const allUsers = await prisma.users.findMany();
//         res.json(allUsers);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // ค้นหา Task โดยใช้ Username
// app.get('/tasks/:username', async (req: Request, res: Response) => {
//     const { username } = req.params as {username: string };
//     try {
//         // 1. หา User คนนี้ก่อนว่ามีตัวตนไหม
//         const user = await prisma.users.findUnique({
//             where: { username: username }
//         });

//         if (!user) {
//             return res.status(404).json({ error: "ไม่พบชื่อผู้ใช้งานนี้" });
//         }

//         // 2. ดึง Task ของ User คนนั้นออกมา
//         const userTasks = await prisma.tasks.findMany({
//             where: { user_id: user.id }
//         });

//         res.json(userTasks);
//     } catch (error) {
//         res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
//     }
// });

// app.get('/users/:userId/tasks', async (req: Request, res: Response) => {
//     const { userId } = req.params;
//     try {
//         const userTasks = await prisma.tasks.findMany({
//             where: {
//                 user_id: Number(userId) // กรองหาเฉพาะงานของ user id นี้
//             }
//         });
//         res.json(userTasks);
//     } catch (error) {
//         res.status(500).json({ error: "หา Task ของ User คนนี้ไม่เจอ" });
//     }
// });

app.post('/register', async (req, res) => {
     try {
        const { username, password, email} = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "กรุณากรอก username และ password" });
        }
        if (username.lenght > 50) return res.status(400).json({ error: 'Username too long' })
        if (password.lenght < 6) return res.status(400).json({ error: 'Password too short' })
        const existingUser = await prisma.users.findUnique({
            where: { username: username }
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Username นี้ถูกใช้งานแล้ว' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.create({
            data: {
                username,
                password_hash: hashedPassword,
                email: email || null
            }
        });
        res.json({ message: "สมัครสมาชิกสำเร็จ!" });
    } catch (error) {
        console.error('REGISTER ERROR:', error)
        res.status(500).json({ error: 'ลงทะเบียนใช้งานระบบไม่สำเร็จ\nความเป็นไปได้\n1.Email นี้ถูกใช้งานแล้ว' });
    }
});

app.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'กรุณากรอก username และ password' });
        }
        const user = await prisma.users.findUnique({
            where: { username: username }
        });
        if (!user) {
            return res.status(401).json({ error: "ไม่พบผู้ใช้งานนี้" });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
        // Login สำเร็จ! (เดี๋ยวเราจะมาทำเรื่องการส่ง Token ต่อ)
        const token = jwt.sign(
            { id: user.id, username: user.username},
            JWT_SECRET,
            {expiresIn: '7d'}
        );
        res.json({ message: "Login สำเร็จ!", token: token });
    } else {
        res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }
    } catch (error) {
        console.error('LOGIN ERROR', error)
        res.status(500).json({ error: "เข้าสู่ระบบไม่สำเร็จ" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});