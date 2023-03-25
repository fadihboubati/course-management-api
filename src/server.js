'use strict';

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());


const handle404Error = require('./error-handlers/404');
const handle500Error = require('./error-handlers/500');



const homeRoute = require('./routes/home.routes');


const { PrismaClient } = require('@prisma/client');
const bearerAuthMiddleware = require('./middlewares/bearer-auth.middleware');
const aclMiddleware = require('./middlewares/acl.middleware');
const { use } = require('./routes/home.routes');
const prisma = new PrismaClient();
//  ----- Routes -----  //
app.use('/', homeRoute);

// completed
app.post('/admin/createInstructor', async (req, res) => {
    const { username } = req.body;

    let user = await prisma.user.create({
        data: {
            username: username,
            role: 'INSTRUCTOR',
        },
    });

    res.status(201).send(user);
});

// completed
app.get('/admin/createStudent', async (req, res) => {
    const { username } = req.body;

    let user = await prisma.user.create({
        data: {
            username: username,
        },
    });

    res.status(201).send(user);
});

// =================================================== 
// =================== Student ====================-==
// =================================================== 
// // enroll courses
// // check the course details
// // like the course or comment
// // review and rate the course

// completed
app.post('/student/enroll', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    console.log(token);
    const user = await prisma.user.findUnique({
        where: { username: token },
    });
    console.log(user);
    if (user.role !== 'STUDENT') {
        res.status(401).send('Unauthorized');
    }
    const { courseId } = req.body;
    const studentId = user.id;

    const enrolled = await prisma.enrollment.create({
        data:
        {
            courseId: courseId,
            studentId: studentId,
            enrolled: true,
        },
    });
    res.status(201).send(enrolled);
});

// app.put('/student/enroll', bearerAuthMiddleware, aclMiddleware("student"), async (req, res) => {
app.put('/student/enroll', bearerAuthMiddleware, async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { username: token },
    });
    if (user.role !== 'STUDENT') {
        res.status(401).send('Unauthorized');
    }

    const { courseId, enrolled } = req.body;
    const studentId = user.id;
    const data = await prisma.enrollment.update({
        where: {
            courseId_studentId: { courseId, studentId },
        },
        data: {
            enrolled: enrolled,
        },
    });

    res.send(data);
});

// completed
app.get('/student/courseDetails', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { username: token },
    });
    if (user.role !== 'STUDENT') {
        res.status(401).send('Unauthorized');
    }

    const { courseId } = req.body;
    const details = await prisma.course.findUnique({
        where: { id: courseId },
        select: { description: true },
    });
    res.send(details);
});

// completed
app.post('/courses/:id/like', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { username: token },
    });
    if (user.role !== 'STUDENT') {
        res.status(401).send('Unauthorized');
    }

    // user and course Id
    const userId = user.id;
    const courseId = parseInt(req.params.id)

    // get the target course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { likedBy: true }
    });

    // check if the course is already liked by the user
    const alreadyLiked = course.likedBy.some(user => user.id == userId);
    if (alreadyLiked) {
        res.status(400).send("User Already liked the course");
    }

    const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
            likedBy: {
                connect: { id: userId }
            },
            likes: course.likes + 1
        }
    })


    res.json(updatedCourse);
});

// completed
app.post('/course/:id/comments', bearerAuthMiddleware, aclMiddleware('STUDENT'), async (req, res) => {

    const courseId = Number(req.params.id);
    const course = await prisma.course.findUnique({
        where: { id: courseId }
    });
    const userId = req.user.id;

    const text = req.body.comment;
    const comment = await prisma.comment.create({
        data: {
            comment: text,
            courseId: course.id,
            studentId: userId,
        }
    })

    res.json(comment);

})

// WIP(work in progress)
app.get('/courses/:id1/comment/:id2/like', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'STUDENT') {
        res.status(401).send('Unauthorized');
    }
    res.send('liked a comment');
});

// not completed
app.get('createReview', (req, res) => {
    res.send('created');

});

// =================================================== 
// =================== instructor ==================== 
// =================================================== 
// CRUD course
// check each course like / comments / review
// check his rate over all courses
app.get('/instructor/course', async (req, res) => {

    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================

    const course = await prisma.course.findMany({
        where: { instructorId: user.id },
    });

    res.send(course);
});

app.post('/instructor/Course', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================
    res.send('create course');

});

app.delete('/instructor/course', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================
    res.send('delete course');
});

app.put('/instructor/course', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================
    res.send('update course');

});
// check each course like / comments / review
app.get('/checkLikes', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================

    let { id } = req.query;
    id = Number(id);
    const course = await prisma.course.findUnique({ where: { id } });
    // console.log(likesNumbers.likes);
    // const _ = await prisma.course.update({
    //     where: { id },

    // });
    let result = {
        courseName: course.name,
        likes: course.likes,
    };
    res.send(result);

});

app.get('/instructor/checkComments', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================
    res.send('checkLikes');
});

app.get('/instructor/checkReview', async (req, res) => {
    // its not a real token, its the user id, but I will assume its a token for authorization purpose
    const basicHeaderParts = req.headers.authorization.split(' ');
    const token = basicHeaderParts[1];
    const user = await prisma.user.findUnique({
        where: { id: token },
    });
    if (user.role !== 'INSTRUCTOR') {
        res.status(401).send('Unauthorized');
    }
    // =================================================
    res.send('checkReview');
});

// check his rate over all courses


//  ----- Error handlers -----  //
app.use(handle404Error);
app.use(handle500Error);


async function start(port, prisma) {

    app.listen(port, () => console.log(`The server is running on port: ${port}`));


    // when we are finished using the prisma instance, we should close the connection with prisma.$disconnect(),
    // if you don't, it could cause an unexpected behavior,
    // like memory leaks or resource starvation.
    process.on('SIGINT', () => {
        prisma.$disconnect();
        process.exit();
    });
}


module.exports = {
    start,
    app, // to import it in the test file for testing the routes
};
