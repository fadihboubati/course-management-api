'use strict';

const express = require('express');

const app = express();

// ===== to improve the security
// The order of the middleware functions does not necessarily matter in this case, as long as they are called before your routes are defined.
// However, it's a good practice to call the more critical middleware functions first, and then the less critical ones.
// In this case, helmet is a more critical security package as it sets various HTTP headers that protect against common attacks,
// so it's a good idea to call it first.Then, cors is called to set the Cross - Origin Resource Sharing policy.

//1. helmet 
const helmet = require("helmet");
app.use(helmet());

// 2 cors
const cors = require('cors');
app.use(cors());
// ===== 


//  logger middleware
const morgan = require("morgan")

// Only development environment
// const DEVMODE = process.env.NODE_ENV
if (app.get('env') == "development") {
    console.log("=== Development Environment ===");
    app.use(morgan("tiny"))
}

// Only production environment

// to test and run the code in the production env,
// stop the server, run the following command in the terminal
// Linux, mac       : export NODE_ENV=production
// win cmd          : set NODE_ENV=production
// win powershell   : $env:NODE_ENV="production"
// then run again the server
if (app.get("env") == 'production') {
    console.log("=== Production Environment ===");
}


app.use(express.json());

const handle404Error = require('./error-handlers/404');
const handle500Error = require('./error-handlers/500');



const homeRoute = require('./routes/home.routes');


const { PrismaClient } = require('@prisma/client');
const bearerAuthMiddleware = require('./middlewares/bearer-auth.middleware');
const aclMiddleware = require('./middlewares/acl.middleware');
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
                // disconnect : {id: userId}
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

// completed
app.post('/comment/:commentId/like', bearerAuthMiddleware, aclMiddleware('STUDENT'), async (req, res) => {
    const userId = req.user.id
    const commentId = Number(req.params.commentId);

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { likedBy: true }

    })


    const alreadyLiked = comment.likedBy.some(user => user.id == userId);
    if (alreadyLiked) {
        res.status(400).send({ status: 'error', message: 'User already like the comment' });
    }

    // get the targets comment & course
    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
            likedBy: {
                connect: { id: userId }
            },
            likes: comment.likes + 1
        }
    })

    res.status(200).send({ status: 'success', message: 'Like added successfully' });
});

// completed
app.post('/comment/:commentId/unlike', bearerAuthMiddleware, aclMiddleware('STUDENT'), async (req, res) => {
    const userId = req.user.id
    const commentId = Number(req.params.commentId);

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { likedBy: true }

    })


    const alreadyLiked = comment.likedBy.some(user => user.id == userId);
    if (!alreadyLiked) {
        res.status(400).send({ status: 'error', message: 'User did not like the comment' });
    }

    // get the targets comment & course
    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
            likedBy: {
                disconnect: { id: userId }
            },
            likes: comment.likes - 1
        }
    })

    res.status(200).send({ status: 'success', message: 'Like removed successfully' });

})

// WIP(work in progress)
app.get('createReview', (req, res) => {
    res.send('created');

});

// =================================================== 
// =================== instructor ==================== 
// =================================================== 
// CRUD course
// check each course like / comments / review
// check his rate over all courses

// not completed
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

// not completed
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

// not completed
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

// not completed
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

// not completed
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


// not completed
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

// not completed
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
