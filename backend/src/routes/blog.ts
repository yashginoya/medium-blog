import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput, updateBlogInput } from "@yashginoya/medium-common";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();


blogRouter.use('*', async (c, next) => {
    const header = c.req.header('Authorization') || '';
    if (!header) {
        c.status(403);
        return c.json({ error: "no token provided" });
    }
    const token = header.split(' ')[1];
    try {
        const payload = await verify(token, c.env.JWT_SECRET);
        if (!payload) {
            c.status(403);
            return c.json({ error: "unauthorized" });
        }
        c.set('userId', payload.id);
        await next();
    } catch (e) {
        c.status(403);
        return c.json({ error: "invalid token" });
    }
})


blogRouter.post('/', async (c) => {

    const userId = c.get('userId');

    try {
        const body = await c.req.json();
        const { success } = createBlogInput.safeParse(body);
        if (!success) {
            c.status(411);
            return c.json({
                msg: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
        return c.json(post);
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while creating post" });
    }
})

blogRouter.put('/', async (c) => {
    const userId = c.get('userId')
    try {
        const body = await c.req.json();
        const { success } = updateBlogInput.safeParse(body);
        if (!success) {
            c.status(411);
            return c.json({
                msg: "Inputs not correct"
            })
        }
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        const post = await prisma.post.update({
            where: {
                id: body.id,
                authorId: userId
            },
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({ msg: 'Post Updated Successfully' });
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while updating post" });
    }
})

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const { id } = c.req.param();
    try {
        const post = await prisma.post.findUnique({
            where: {
                id
            },
            select : {
                content:true,
                title: true,
                id:true,
                author : {
                    select :{
                        name: true
                    }
                }
               }
        });
        if (!post) {
            c.status(403);
            return c.json({ error: "post not found" });
        }
        return c.json(post);
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while fetching post" });
    }
})

blogRouter.get('/bulk/all', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findMany({
            select:{
                content:true,
                title : true,
                id : true,
                author : {
                    select : {
                        name: true
                    }
                }
            }
        });
        return c.json(post);
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while fetching post" });
    }
})

blogRouter.post('/deleteBlog', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const body = await c.req.json();
        const result = await prisma.post.delete({ 
            where : {
                id : body.id
            }
         });
        return c.json({msg: "Post deleted Successfully"});
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while deleting post" });
    }
})