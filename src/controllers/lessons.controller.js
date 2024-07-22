const path = require('path');
const { v4: uuid } = require('uuid');
const Joi = require('joi');
const { prisma } = require('../utils/connection');

const create = async (req, res, next) => {
    try {
        const { title, courseId } = req.body;
        const { video } = req.files;
        const schema = Joi.object({
            title: Joi.string().min(3).max(100).required(),
            courseId: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const findCourse = await prisma.courses.findUnique({ where: { id: courseId } });
        if (!findCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const videoName = `${uuid()}${path.extname(video.name)}`;
        video.mv(`${process.cwd()}/uploads/${videoName}`);

        const lesson = await prisma.lessons.create({
            data: {
                title,
                video: videoName,
                courseId
            }
        });
        res.status(201).json({ message: "Success", lesson });

    } catch (error) {
        next(error);
    }
}

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, courseId } = req.body;
        const { video } = req.files;
        const schema = Joi.object({
            title: Joi.string().min(3).max(100).required(),
            courseId: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const findLesson = await prisma.lessons.findUnique({ where: { id } });
        if (!findLesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        const findCourse = await prisma.courses.findUnique({ where: { id: courseId } });
        if (!findCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const videoName = `${uuid()}${path.extname(video.name)}`;
        video.mv(`${process.cwd()}/uploads/${videoName}`);

        const updatedLesson = await prisma.lessons.update({
            where: { id },
            data: {
                title,
                video: videoName,
                courseId
            },
        });
        res.json({ message: "Success", lesson: updatedLesson });
    } catch (error) {
        next(error);
    }
}

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const findLesson = await prisma.lessons.findUnique({ where: { id } });
        if (!findLesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        await prisma.lessons.delete({ where: { id } });
        res.json({ message: "Success" });
    } catch (error) {
        next(error);
    }
}

const show = async (req, res, next) => {
    try {
        const lessons = await prisma.lessons.findMany({
            select: {
                id: true,
                title: true,
                video: true,
                course: true
            }
        })
        res.json({lessons});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    update,
    remove,
    show,
}