const bcrypt = require('bcrypt');
const { prisma } = require("./connection")

const insertAdmin = async () => {
    const hashedPassword = await bcrypt.hash('4444', 12);
    const admin = await prisma.users.create({
        data: {
            fullname: "admin",
            phone: "998",
            password: hashedPassword,
            isAdmin: true,
        }
    })
    console.log(`Admin created successfully: \n phone: ${admin.phone}\n password: 4444`)
}

insertAdmin();