const path = require('path');
const { v4: uuid } = require('uuid');
const Joi = require('joi');
const { prisma } = require('../utils/connection');

const create = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const { photo } = req.files;
        const schema = Joi.object({
            title: Joi.string().min(3).max(100).required(),
            description: Joi.string().min(5).max(500).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const findCourse = await prisma.courses.findUnique({ where: { title } })
        if (findCourse) {
            return res.status(400).json({ message: "Course already exists" });
        }

        const photoName = `${uuid()}${path.extname(photo.name)}`
        photo.mv(`${process.cwd()}/uploads/${photoName}`);

        const course = await prisma.courses.create({
            data: {
                title,
                description,
                photo: photoName,
            },
        });
        res.status(201).json({ message: "Success", course });
    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const { photo } = req.files;

        const schema = Joi.object({
            title: Joi.string(),
            description: Joi.string()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const findCourse = await prisma.courses.findUnique({ where: { id } });
        if (!findCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const courseExists = await prisma.courses.findUnique({ where: { title } });
        if (courseExists && courseExists.id !== id) {
            return res.status(400).json({ message: "Course title already exists" });
        }

        const photoName = `${uuid()}${path.extname(photo.name)}`
        photo.mv(`${process.cwd()}/uploads/${photoName}`);

        const updatedCourse = await prisma.courses.update({
            where: { id },
            data: {
                title: title,
                description: description,
                photo: photoName
            },
        });
        res.json({ message: "Success", course: updatedCourse });

    } catch (error) {
        next(error)
    }
}

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const findCourse = await prisma.courses.findUnique({ where: { id } });
        if (!findCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        await prisma.courses.delete({ where: { id } });
        res.json({ message: "Success" });
    } catch (error) {
        next(error)
    }
}

const show = async (req, res, next) => {
    try {
        const courses = await prisma.courses.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                photo: true,
                lessons: true,
                enrolledUsers: true,
                _count: true
            }
        })
        res.json({ message: "Success", courses });
    } catch (error) {
        next(error)
    }
}

const enroll = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const findCourse = await prisma.courses.findUnique({ where: { id: courseId } });
        if (!findCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isEnrolled = await prisma.courseUsers.findFirst({
            where: { userId: req.user.id, courseId }
        })
        if (isEnrolled) {
            return res.status(400).json({ message: "You are already enrolled in this course" });
        }

        const course = await prisma.courseUsers.create({
            data: {
                userId: req.user.id,
                courseId
            },
            select: {
                user: true,
                course: true
            }
        })
        res.json({ message: "Success", course });
    } catch (error) {
        next(error)
    }
}

const enrollments = async (req, res, next) => {
    try {
        const enrolledCourses = await prisma.courseUsers.findMany({
            where: { userId: req.user.id },
            select: {
                course: true
            }
        })
        res.json({ enrolledCourses });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    create,
    update,
    remove,
    show,
    enroll,
    enrollments,
}