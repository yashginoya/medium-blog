import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { signinInput, signupInput } from "@yashginoya/medium-common";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

userRouter.post('/signup', async (c) => {
    try {
        const body = await c.req.json();
        const { success } = signupInput.safeParse(body);
        if (!success) {
            c.status(411);
            return c.json({
                msg: "Inputs not correct"
            })
        }
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            }
        });
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while signing up" });
    }
})

userRouter.post('/signin', async (c) => {
    try {
        const body = await c.req.json();
        const { success } = signinInput.safeParse(body);
        if (!success) {
            c.status(411);
            return c.json({
                msg: "Inputs not correct"
            })
        }
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found" });
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while signing in" });
    }
})

userRouter.post('/deleteUser', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const body = await c.req.json();
        const result = await prisma.user.delete({ 
            where : {
                email : body.email
            }
         });
        return c.json({msg: "User deleted Successfully"});
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while deleting user" });
    }
})