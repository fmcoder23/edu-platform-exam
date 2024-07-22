const Joi = require('joi');
const bcrypt = require('bcrypt');
const { prisma } = require('../utils/connection');
const { createToken } = require('../utils/jwt');

const register = async (req, res, next) => {
    try {
        const { fullname, phone, password } = req.body;
        const schema = Joi.object({
            fullname: Joi.string().min(3).max(50).required(),
            phone: Joi.string().min(5).max(15).required(),
            password: Joi.string().min(4).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const findUser = await prisma.users.findUnique({ where: { phone } })
        if (findUser) {
            return res.status(400).json({ message: "Phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.users.create({
            data: {
                fullname,
                phone,
                password: hashedPassword,
            }
        });
        const token = createToken({ id: user.id, isAdmin: user.isAdmin })
        res.status(201).json({ message: "Success", token });
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;
        const schema = Joi.object({
            phone: Joi.string().min(5).max(15).required(),
            password: Joi.string().min(4).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const user = await prisma.users.findUnique({ where: { phone } });
        if (!user) {
            return res.status(401).json({ message: "Invalid phone or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid phone or password" });
        }
        const token = createToken({ id: user.id, isAdmin: user.isAdmin })
        res.json({ message: "Success", token });
    } catch (error) {
        next(error);
    }
}

const adminLogin = async (req, res, next) => {
    try {
        const { phone, password } = req.body;
        const schema = Joi.object({
            phone: Joi.string().min(3).max(15).required(),
            password: Joi.string().min(4).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const user = await prisma.users.findUnique({ where: { phone, isAdmin: true } });
        if (!user) {
            return res.status(401).json({ message: "Invalid phone or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid phone or password" });
        }
        const token = createToken({ id: user.id, isAdmin: true });
        res.json({ message: "Success", token });
    } catch (error) {
        next(error);
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                fullname: true,
                phone: true,
                isAdmin: true,
                createdAt: true,
                enrolledCourses: true
            }
        })
        res.json({ users });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    adminLogin,
    getUsers,
}