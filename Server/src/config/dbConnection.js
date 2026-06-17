import mongoose from "mongoose";

/*
 * mongoose.set("strictQuery", false); sets Mongoose's query strictness to false.
 * This means that Mongoose will not return an error if you try to query for a
 * non-existent field. Instead, it will simply return an empty result.
 * With strict query set to true, Mongoose will return an error if you try to
 * query for a non-existent field.
 */

mongoose.set("strictQuery", false);

const connectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_ATLAS}/${process.env.DB_NAME}`
    );
    console.log(
      `DB connected Successfully !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("DB not Connected !", error);
    process.exit(1);
  }
};

export default connectToDB;
