import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const load = async () => {
  try {
    await prisma.note.deleteMany();
    console.log("Deleted records in note table");

    await prisma.$queryRaw`ALTER TABLE Note AUTO_INCREMENT = 1`;
    console.log("reset note auto increment to 1");

    const notes = Array.from({ length: 10 }).map((_, i) => ({
      title: `Note ${i}`,
      content: `This is note ${i}`,
      authorId: "1",
      createdAt: new Date(new Date().setMinutes(i * 17)),
    }));

    await prisma.note.createMany({
      data: notes,
    });
    console.log("Added note data");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
